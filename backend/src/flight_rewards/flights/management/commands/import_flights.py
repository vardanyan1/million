from django.core.management.base import BaseCommand

from flight_rewards.flights.services import import_flights


class Command(BaseCommand):
    help = "Import flights from csv"

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, default=None)

    def handle(self, *args, **options):
        filename = options.pop('filename')
        with open(filename, 'r') as file:
            import_flights(file)
