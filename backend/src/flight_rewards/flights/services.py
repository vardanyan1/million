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


def process_columns(row, *columns):
    processed = {}
    for column in columns:
        processed[column] = row[column].split(inner_delimiter)
    return processed


def read_flights(file: str):
    cache = {}
    csv_reader = csv.DictReader(file)
    for row in csv_reader:
        key = f"{row['Connection Airport Codes']}{row['Departure Date']}{row['Arrival Date']}{row['Aircraft Details']}"
        item = cache.get(key)
        if not item:
            origin = Airport.objects.filter(code=row['Origin Code']).first()
            destination = Airport.objects.filter(code=row['Destination Code']).first()
            source = row.get('Source', 'QF')
            points_per_adult = row['Points Per Adult']
            tax_per_adult = float(row['Tax Per Adult'].replace('$', ''))
            stop_overs = int(row['StopOvers']) if row['StopOvers'].isdigit() else None
            remaining_seats = row['Remaining Seats']
            designated_class = row['Designated Class']
            timestamp = make_aware(parser.parse(row['TimeStamp']))

            processed_columns = process_columns(row, 'Connection Airport Codes', 'Departure Date',
                                                'Arrival Date', 'Flight Duration(s)', 'RBD',
                                                'Aircraft Details', 'Cabin Type', 'Equipment')

            transition_times = row['Transition Time'].split(inner_delimiter)

            connections = []
            for i in range(len(processed_columns['Connection Airport Codes'])):
                connection = {
                    'origin': row['Origin Code'] if processed_columns['Connection Airport Codes'][i] == 'Direct flight'
                    else processed_columns['Connection Airport Codes'][i].split('-')[0],

                    'destination': row['Destination Code'] if processed_columns['Connection Airport Codes'][
                                                                  i] == 'Direct flight'
                    else processed_columns['Connection Airport Codes'][i].split('-')[1],

                    'departure_date': processed_columns['Departure Date'][i],
                    'arrival_date': processed_columns['Arrival Date'][i],
                    'duration': processed_columns['Flight Duration(s)'][i],
                    'transition_time': transition_times[i] if i < len(transition_times) else None,
                    'aircraft_details': processed_columns['Aircraft Details'][i],
                    'flight_class': processed_columns['Cabin Type'][i],
                    'equipment': processed_columns['Equipment'][i],
                    'RBD': processed_columns['RBD'][i]
                }
                connections.append(connection)

            item = {
                'origin': origin,
                'destination': destination,
                'connections': connections,
                'departure_date': make_aware(parser.parse(processed_columns['Departure Date'][0])),
                'source': source,
                'points_per_adult': points_per_adult,
                'tax_per_adult': tax_per_adult,
                'remaining_seats': remaining_seats,
                'designated_class': designated_class,
                'stop_overs': stop_overs,
                'timestamp': timestamp,
            }
            cache[key] = item
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
