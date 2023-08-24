import csv
from django.utils.timezone import make_aware
from datetime import datetime
import logging

from flight_rewards.flights.models import Flight, FlightDetail, FlightClassDetail, Airport

logger = logging.getLogger(__name__)


def import_airports(filename: str):
    with open(filename, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            Airport.objects.get_or_create(code=row['Airport Code(s)'], defaults={'name': row['Airport Name(s)']})


def import_flights_from_csv(file_obj):
    csv_reader = csv.DictReader(file_obj)
    for row in csv_reader:
        main_origin = Airport.objects.get(code=row['Origin Code'])
        main_destination = Airport.objects.get(code=row['Destination Code'])
        timestamp = make_aware(datetime.strptime(row['TimeStamp'], "%Y-%m-%d %H:%M:%S"))

        # Get or create Flight
        flight, flight_created = Flight.objects.get_or_create(
            origin=main_origin,
            destination=main_destination,
            stopovers=row['StopOvers'],
            source=row['Source'],
            timestamp=timestamp
        )

        # If flight was just created, add FlightDetails
        if flight_created:
            connection_codes = row['Connection Airport Codes'].split(', ')
            departure_dates = row['Departure Date'].split(', ')
            arrival_dates = row['Arrival Date'].split(', ')
            durations = row['Flight Duration(s)'].split(', ')
            transition_times = row['Transition Time'].split(', ')
            aircraft_details = row['Aircraft Details'].split(', ')
            equipment_list = row['Equipment'].split(', ')

            for idx, code in enumerate(connection_codes):
                if code == "Direct flight":
                    from_airport = main_origin
                    to_airport = main_destination
                else:
                    from_airport_code, to_airport_code = code.split('-')
                    try:
                        from_airport = Airport.objects.get(code=from_airport_code)
                        to_airport = Airport.objects.get(code=to_airport_code)
                    except Airport.DoesNotExist:
                        logger.error(f"Airport not found for code {from_airport_code} or {to_airport_code}")
                        continue

                # Create FlightDetail for each connection
                FlightDetail.objects.create(
                    flight=flight,
                    from_airport=from_airport,
                    to_airport=to_airport,
                    departure_date=make_aware(datetime.strptime(departure_dates[idx], "%Y-%m-%d %H:%M:%S")),
                    arrival_date=make_aware(datetime.strptime(arrival_dates[idx], "%Y-%m-%d %H:%M:%S")),
                    flight_duration=durations[idx],
                    transition_time=transition_times[idx] if idx < len(transition_times) else None,
                    aircraft_details=aircraft_details[idx],
                    equipment=equipment_list[idx]
                )

        # Check if FlightClassDetail already exists for current flight and class combo
        class_exists = FlightClassDetail.objects.filter(
            flight=flight,
            cabin_type=row['Cabin Type']
        ).exists()

        if not class_exists:
            # Create FlightClassDetail for each flight class
            FlightClassDetail.objects.create(
                flight=flight,
                cabin_type=row['Cabin Type'],
                rbd=row['RBD'],
                points_per_adult=int(row['Points Per Adult']),
                tax_per_adult=float(row['Tax Per Adult'].replace('$', '')),
                remaining_seats=int(row['Remaining Seats']),
                designated_class=row['Designated Class']
            )

    logger.info('Successfully imported flights from CSV')
