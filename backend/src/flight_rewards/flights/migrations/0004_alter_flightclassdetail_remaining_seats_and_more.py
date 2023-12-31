# Generated by Django 4.2 on 2023-11-22 17:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flights', '0003_alter_availabilitynotification_preferred_programs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='flightclassdetail',
            name='remaining_seats',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='flightdetail',
            name='equipment',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
