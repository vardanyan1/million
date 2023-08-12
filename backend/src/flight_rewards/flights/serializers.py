from rest_framework import serializers
from rest_framework.fields import empty
from djoser.serializers import UserSerializer
from djstripe.models import Plan

from flight_rewards.flights.models import Flight, Airport, Contact, AvailabilityNotification


class CurrentUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('subscription',)


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'


class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        exclude = ('modified', )
        depth = 1



class FlightDateListSerializer(serializers.ListSerializer):
    def to_representation(self, data):
        result = {}
        for item in data:
            result.setdefault(item['date'], [])
            for aval in item['availabilities']:
                if aval['flight_class'] not in result[item['date']]:
                    result[item['date']].append(aval['flight_class'])
        output = []
        for date, availabilities in result.items():
            entry = { 'date': date, 'availabilities': availabilities }
            output.append(entry)
        return output

class FlightDateSerializer(serializers.Serializer):
    date = serializers.DateField()
    availabilities = serializers.SerializerMethodField(method_name='get_availabilities')

    class Meta:
        list_serializer_class = FlightDateListSerializer

    def get_availabilities(self, obj):
        return [item['flight_class'] for item in obj['availabilities']]


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class AvailabilityNotificationSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    def __init__(self, instance=None, data=empty, **kwargs):
        setattr(self.Meta, 'depth', 1 if instance else 0)
        super().__init__(instance, data, **kwargs)
    class Meta:
        model = AvailabilityNotification
        fields = '__all__'
        # depth = 1


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ('id', 'interval', 'amount')