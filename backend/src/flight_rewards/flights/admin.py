from django.contrib import admin
from flight_rewards.flights.models import Contact, Flight, FlightDetail, FlightClassDetail, Airport, User, AvailabilityNotification


class FlightDetailInline(admin.TabularInline):
    model = FlightDetail
    extra = 0  # Number of empty forms to show
    show_change_link = True


class FlightClassDetailInline(admin.TabularInline):
    model = FlightClassDetail
    extra = 0
    show_change_link = True


class FlightAdmin(admin.ModelAdmin):
    list_display = ('origin', 'destination', 'stopovers', 'timestamp', 'source')
    search_fields = ('origin__code', 'destination__code', 'source', 'timestamp')
    list_filter = ('origin', 'destination', 'stopovers', 'source')
    inlines = [FlightDetailInline, FlightClassDetailInline]
    ordering = ('-timestamp', 'origin', 'destination')


admin.site.register(Contact)
admin.site.register(Flight, FlightAdmin)
admin.site.register(Airport)
admin.site.register(User)
admin.site.register(AvailabilityNotification)
