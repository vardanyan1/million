from django.core.management.base import BaseCommand
from djstripe.models import APIKey


class Command(BaseCommand):
    help = "Add Stripe API keys if they don't exist."

    def handle(self, *args, **kwargs):
        import os

        live_secret_key = os.environ.get("STRIPE_LIVE_SECRET_KEY")
        test_secret_key = os.environ.get("STRIPE_TEST_SECRET_KEY")

        # if live_secret_key:
        #     live_key, created_live = APIKey.objects.get_or_create_by_api_key(live_secret_key)
        #     if created_live:
        #         self.stdout.write(self.style.SUCCESS("Live Stripe API key added."))
        #     else:
        #         self.stdout.write(self.style.SUCCESS("Live Stripe API key already exists."))
        # else:
        #     self.stdout.write(self.style.ERROR("STRIPE_LIVE_SECRET_KEY environment variable not found."))

        if test_secret_key:
            test_key, created_test = APIKey.objects.get_or_create_by_api_key(test_secret_key)
            if created_test:
                self.stdout.write(self.style.SUCCESS("Test Stripe API key added."))
            else:
                self.stdout.write(self.style.SUCCESS("Test Stripe API key already exists."))
        else:
            self.stdout.write(self.style.ERROR("STRIPE_TEST_SECRET_KEY environment variable not found."))
