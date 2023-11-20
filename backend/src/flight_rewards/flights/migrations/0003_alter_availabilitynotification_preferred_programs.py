# Generated by Django 4.2 on 2023-11-20 22:14

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flights', '0002_alter_availabilitynotification_flight_classes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='availabilitynotification',
            name='preferred_programs',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Virgin Velocity', 'VA'), ('Qantas FF', 'QF')], max_length=20), blank=True, null=True, size=None),
        ),
    ]
