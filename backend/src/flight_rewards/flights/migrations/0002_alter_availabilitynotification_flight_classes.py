# Generated by Django 4.2 on 2023-09-03 09:02

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flights', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='availabilitynotification',
            name='flight_classes',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[('Economy', 'ECONOMY'), ('PremiumEconomy', 'PREMIUM_ECONOMY'), ('Business', 'BUSINESS'), ('First', 'FIRST')], max_length=20), size=None),
        ),
    ]
