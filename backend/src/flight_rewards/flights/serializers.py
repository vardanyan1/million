from django.db.models import Count

from rest_framework import serializers
from rest_framework.fields import empty
from djoser.serializers import UserSerializer
from djstripe.models import Plan

from flight_rewards.flights import FLIGHT_CLASSES
from flight_rewards.flights.models import Airport, Contact, AvailabilityNotification, Flight, FlightDetail, \
    FlightClassDetail


class CurrentUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('subscription',)


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'

class FlightDetailSerializer(serializers.ModelSerializer):
    from_airport = serializers.StringRelatedField()
    to_airport = serializers.StringRelatedField()

    class Meta:
        model = FlightDetail
        exclude = ('flight',)  # Exclude 'flight' field


class FlightClassDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightClassDetail
        exclude = ('flight',)  # Exclude 'flight' field


class AirportIdCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = ('id', 'code', 'name')

class FlightSerializer(serializers.ModelSerializer):
    details = FlightDetailSerializer(many=True, read_only=True)
    class_details = FlightClassDetailSerializer(many=True, read_only=True)
    origin = AirportIdCodeSerializer(read_only=True)  # changed from StringRelatedField
    destination = AirportIdCodeSerializer(read_only=True)  # changed from StringRelatedField

    class Meta:
        model = Flight
        fields = '__all__'


class FlightDepartureDateSerializer(serializers.Serializer):
    date = serializers.DateField()
    availabilities = serializers.ListField(child=serializers.CharField())


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class AvailabilityNotificationSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    origin = serializers.PrimaryKeyRelatedField(
        queryset=Airport.objects.annotate(num_departures=Count('departure_flights'))
        .filter(num_departures__gt=0)
    )
    destination = serializers.PrimaryKeyRelatedField(
        queryset=Airport.objects.annotate(num_arrivals=Count('arrival_flights'))
        .filter(num_arrivals__gt=0)
    )

    def __init__(self, instance=None, data=empty, **kwargs):
        setattr(self.Meta, 'depth', 1 if instance else 0)
        super().__init__(instance, data, **kwargs)

    def validate_flight_classes(self, value):
        # Custom logic to validate that value is one of the allowed choices
        for v in value:
            if v not in [cls.value for cls in FLIGHT_CLASSES]:
                raise serializers.ValidationError("Invalid flight class")
        return value

    class Meta:
        model = AvailabilityNotification
        fields = '__all__'


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ('id', 'interval', 'amount')
