from django.contrib import admin

# Register your models here.
from flight_rewards.flights.models import Contact, Flight, Airport, User, AvailabilityNotification


admin.site.register(Contact)
admin.site.register(Flight)
admin.site.register(Airport)
admin.site.register(User)
admin.site.register(AvailabilityNotification)