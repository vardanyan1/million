# Generated by Django 4.2 on 2023-09-02 19:39

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import django_extensions.db.fields
import flight_rewards.flights
import flight_rewards.flights.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('first_name', models.CharField(max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(max_length=150, verbose_name='last name')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', flight_rewards.flights.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Airport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50)),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Flight',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stopovers', models.PositiveIntegerField()),
                ('source', models.CharField(max_length=255)),
                ('timestamp', models.DateTimeField()),
                ('flight_start_date', models.DateTimeField(blank=True, null=True)),
                ('flight_end_date', models.DateTimeField(blank=True, null=True)),
                ('destination', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='arrival_flights', to='flights.airport')),
                ('origin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departure_flights', to='flights.airport')),
            ],
        ),
        migrations.CreateModel(
            name='FlightDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('departure_date', models.DateTimeField()),
                ('arrival_date', models.DateTimeField()),
                ('flight_duration', models.CharField(max_length=255)),
                ('transition_time', models.CharField(blank=True, max_length=255, null=True)),
                ('aircraft_details', models.CharField(max_length=255)),
                ('equipment', models.CharField(max_length=255)),
                ('flight', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='details', to='flights.flight')),
                ('from_airport', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departure_details', to='flights.airport')),
                ('to_airport', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='arrival_details', to='flights.airport')),
            ],
        ),
        migrations.CreateModel(
            name='FlightClassDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cabin_type', models.CharField(max_length=255)),
                ('rbd', models.CharField(max_length=255)),
                ('points_per_adult', models.PositiveIntegerField()),
                ('tax_per_adult', models.DecimalField(decimal_places=2, max_digits=8)),
                ('remaining_seats', models.PositiveIntegerField()),
                ('designated_class', models.CharField(max_length=255)),
                ('flight', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='class_details', to='flights.flight')),
            ],
        ),
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', django_extensions.db.fields.CreationDateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', django_extensions.db.fields.ModificationDateTimeField(auto_now=True, verbose_name='modified')),
                ('first_name', models.CharField(max_length=255)),
                ('last_name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=255)),
                ('destination', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_interested', to='flights.airport')),
                ('origin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='origin_interested', to='flights.airport')),
            ],
            options={
                'get_latest_by': 'modified',
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='AvailabilityNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('flight_classes', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Economy', 'ECONOMY'), ('Premium Economy', 'PREMIUM_ECONOMY'), ('Business', 'BUSINESS'), ('First', 'FIRST')], max_length=20), size=None)),
                ('preferred_programs', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Virgin Velocity', 'VA'), ('Qantas FF', 'QF')], max_length=20), size=None)),
                ('status', models.CharField(choices=[('Pending', 'PENDING'), ('Sent', 'SENT'), ('Failed', 'FAILED')], default=flight_rewards.flights.NOTIFICATION_STATUS['PENDING'], max_length=20)),
                ('destination', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_notifications', to='flights.airport')),
                ('origin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='origin_notifications', to='flights.airport')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
