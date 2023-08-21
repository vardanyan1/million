from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create admin user"

    def handle(self, *args, **kwargs):
        User = get_user_model()
        admin_email = "admin@admin.com"
        admin_password = "admin"

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(email=admin_email, password=admin_password, first_name="admin",
                                          last_name="admin")
            self.stdout.write("ADMIN_CREATED")
        else:
            self.stdout.write("ADMIN_EXISTS")
