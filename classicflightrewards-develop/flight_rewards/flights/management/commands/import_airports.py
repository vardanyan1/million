from django.core.management.base import BaseCommand

from flight_rewards.flights.services import import_airports


class Command(BaseCommand):
    help = "Import airports from csv"

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, default=None)

    def handle(self, *args, **options):
        filename = options.pop('filename')
        import_airports(filename)
