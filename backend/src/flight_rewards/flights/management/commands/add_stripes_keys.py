from django.core.management.base import BaseCommand
from djstripe.models import APIKey
from django.conf import settings

class Command(BaseCommand):
    help = "Add Stripe API key if it doesn't exist."

    def handle(self, *args, **kwargs):

        STRIPE_SECRET_KEY = getattr(settings, "STRIPE_SECRET_KEY", None)
        STRIPE_LIVE_MODE = getattr(settings, "STRIPE_LIVE_MODE", True)

        if not STRIPE_SECRET_KEY:
            self.stdout.write(self.style.ERROR("STRIPE_SECRET_KEY is not set in settings."))
            return

        if STRIPE_LIVE_MODE:
            live_key, created_live = APIKey.objects.get_or_create_by_api_key(STRIPE_SECRET_KEY)
            if created_live:
                self.stdout.write(self.style.SUCCESS("Live Stripe API key added."))
            else:
                self.stdout.write(self.style.SUCCESS("Live Stripe API key already exists."))
        else:
            test_key, created_test = APIKey.objects.get_or_create_by_api_key(STRIPE_SECRET_KEY)
            if created_test:
                self.stdout.write(self.style.SUCCESS("Test Stripe API key added."))
            else:
                self.stdout.write(self.style.SUCCESS("Test Stripe API key already exists."))
