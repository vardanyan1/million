import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create admin user"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Fetching email and password from environment variables
        admin_email = os.environ.get("ADMIN_EMAIL", "default@admin.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "defaultpassword")

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(email=admin_email, password=admin_password, first_name="admin",
                                          last_name="admin")
            self.stdout.write("ADMIN_CREATED")
        else:
            self.stdout.write("ADMIN_EXISTS")
