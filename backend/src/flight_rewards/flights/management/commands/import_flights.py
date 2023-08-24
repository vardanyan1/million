from django.core.management.base import BaseCommand
from flight_rewards.flights.services import import_flights_from_csv


class Command(BaseCommand):
    help = 'Import flights from CSV'

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, help='The path to the CSV file')

    def handle(self, *args, **kwargs):
        filename = kwargs['filename']
        with open(filename, 'r') as csv_file:
            import_flights_from_csv(csv_file)
        self.stdout.write(self.style.SUCCESS('Successfully imported flights from CSV'))
