import os
import csv
import logging

from dateutil import parser, tz
from django.utils.timezone import make_aware
from django.db import transaction, IntegrityError

from flight_rewards.flights.models import Flight, Airport

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def import_airports(filename: str):
    with open(filename, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            Airport.objects.get_or_create(code=row['Airport Code(s)'],
                                          defaults={'name': row['Airport Name(s)']})


inner_delimiter = ', '


def read_flights(file: str):
    cache = {}
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        key = f"{row['Connection Airport Codes']}{row['Departure Date']}{row['Arrival Date']}{row['Aircraft Details']}"
        item = cache.get(key)
        if not item:
            origin = Airport.objects.filter(code=row['Origin Code']).first()
            destination = Airport.objects.filter(code=row['Destination Code']).first()
            connection_codes = row['Connection Airport Codes'].split(inner_delimiter)
            departure_dates = row['Departure Date'].split(inner_delimiter)
            arrival_dates = row['Arrival Date'].split(inner_delimiter)
            flight_durations = row['Flight Duration(s)'].split(inner_delimiter)
            transition_times = row['Transition Time'].split(inner_delimiter)
            aircraft_details = row['Aircraft Details'].split(inner_delimiter)
            RBD = row['RBD']
            stop_overs = int(row['StopOvers']) if row['StopOvers'].isdigit() else None
            timestamp = make_aware(parser.parse(row['TimeStamp']))
            # New fields
            equipment = row['Equipment']
            remaining_seats = row['Remaining Seats']
            designated_class = row['Designated Class']

            connections = []
            for (code, dep_date, ar_date, dur, trans, aircraft) in zip(
                    connection_codes, departure_dates, arrival_dates, flight_durations, transition_times,
                    aircraft_details
            ):
                connection = {
                    'origin': row['Origin Code'] if code == 'Direct flight' else code.split('-')[0],
                    'destination': row['Destination Code'] if code == 'Direct flight' else code.split('-')[1],
                    'departure_date': dep_date,
                    'arrival_date': ar_date,
                    'duration': dur,
                    'transition_time': trans,
                    'aircraft_details': aircraft
                    # Add other connection-related fields if needed
                }
                connections.append(connection)
            item = {
                'origin': origin,
                'destination': destination,
                'connections': connections,
                'departure_date': make_aware(parser.parse(departure_dates[0])),
                'tax_per_adult': float(row['Tax Per Adult'].replace('$', '')),
                'source': row.get('Source', 'QF'),
                'availabilities': [{'flight_class': row['Cabin Type'], 'points': row['Points Per Adult']}],
                # Add other fields as needed
                'equipment': equipment,
                'remaining_seats': remaining_seats,
                'designated_class': designated_class,
                'RBD': RBD,
                'stop_overs': stop_overs,
                'timestamp': timestamp,
            }
            cache[key] = item
        else:
            item['availabilities'].append({
                'flight_class': row['Cabin Type'],
                'points': row['Points Per Adult']
            })
    return cache


def import_flights(file: str):
    aggregated_flights = read_flights(file)

    [_, origin, destination, *_] = os.path.basename(file.name).split('_')

    try:
        with transaction.atomic():
            Flight.objects.filter(origin__code=origin, destination__code=destination).delete()
            for flight in aggregated_flights.values():
                Flight.objects.create(**flight)
        logger.info('All flights migrated successfully!')
    except IntegrityError as e:
        logger.error('Error during migration: %s', e)
        raise
