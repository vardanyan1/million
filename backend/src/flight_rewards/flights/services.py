import csv
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
    first_row = next(csv_reader)  # Read the first row to get origin and destination

    # Delete all existing flights with the same origin and destination
    main_origin = Airport.objects.get(code=first_row['Origin Code'])
    main_destination = Airport.objects.get(code=first_row['Destination Code'])
    source = first_row['Source']
    Flight.objects.filter(origin=main_origin, destination=main_destination, source=source).delete()

    # Now process the first row, since we've already read it
    process_row(first_row)

    # Then proceed with the rest of the rows in the CSV
    for row in csv_reader:
        process_row(row)

    logger.info('Successfully imported flights from CSV')


def process_row(row):
    main_origin = Airport.objects.get(code=row['Origin Code'])
    main_destination = Airport.objects.get(code=row['Destination Code'])
    timestamp = datetime.strptime(row['TimeStamp'], "%Y-%m-%d %H:%M:%S")
    first_segment_departure_date = datetime.strptime(row['Departure Date'].split(', ')[0], "%Y-%m-%d %H:%M:%S")
    last_segment_arrival_date = datetime.strptime(row['Arrival Date'].split(', ')[-1], "%Y-%m-%d %H:%M:%S")

    flight, flight_created = Flight.objects.get_or_create(
        origin=main_origin,
        destination=main_destination,
        stopovers=row['StopOvers'],
        source=row['Source'],
        timestamp=timestamp,
        flight_start_date=first_segment_departure_date,
        flight_end_date=last_segment_arrival_date
    )

    if flight_created:
        # Add FlightDetails
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

                from_airport, created_from = Airport.objects.get_or_create(
                    code=from_airport_code,
                    defaults={'name': "-"}
                )
                if created_from:
                    logger.info(f"Airport with code {from_airport_code} added to the database with placeholder name.")

                to_airport, created_to = Airport.objects.get_or_create(
                    code=to_airport_code,
                    defaults={'name': "-"}
                )
                if created_to:
                    logger.info(f"Airport with code {to_airport_code} added to the database with placeholder name.")

            # Handle '-' for equipment
            equipment_value = None if equipment_list[0] == '-' else equipment_list[idx]

            # Create FlightDetail for each connection
            FlightDetail.objects.create(
                flight=flight,
                from_airport=from_airport,
                to_airport=to_airport,
                departure_date=datetime.strptime(departure_dates[idx], "%Y-%m-%d %H:%M:%S"),
                arrival_date=datetime.strptime(arrival_dates[idx], "%Y-%m-%d %H:%M:%S"),
                flight_duration=durations[idx],
                transition_time=transition_times[idx] if idx < len(transition_times) else None,
                aircraft_details=aircraft_details[idx],
                equipment=equipment_value
            )

    # Create FlightClassDetail for each flight class
    class_exists = FlightClassDetail.objects.filter(
        flight=flight,
        cabin_type=row['Cabin Type']
    ).exists()

    if not class_exists:
        FlightClassDetail.objects.create(
            flight=flight,
            cabin_type=row['Cabin Type'],
            rbd=row['RBD'],
            points_per_adult=int(row['Points Per Adult']),
            tax_per_adult=float(row['Tax Per Adult'].replace('$', '')),
            remaining_seats=None if row['Remaining Seats'] == '-' else int(row['Remaining Seats']),
            designated_class=row['Designated Class']
        )
