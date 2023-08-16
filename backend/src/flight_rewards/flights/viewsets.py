"""
Flights app viewsets
"""
from django.db.models import F
from django.conf import settings
from django_filters import rest_framework as filters
from rest_framework import viewsets, pagination, mixins, filters as rest_filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from djoser import views
from djstripe.models import Customer, Plan, Price, Session
from djstripe import settings as djstripe_settings
import stripe

from flight_rewards.flights.models import Flight, Airport, Contact, AvailabilityNotification, User
from flight_rewards.flights.serializers import (
    FlightSerializer, AirportSerializer, FlightDateSerializer, ContactSerializer, 
    AvailabilityNotificationSerializer, SubscriptionPlanSerializer
)


stripe.api_key = settings.STRIPE_TEST_SECRET_KEY


class FlightFilterSet(filters.FilterSet):
    origin = filters.CharFilter(field_name='origin__code', lookup_expr='exact')
    destination = filters.CharFilter(field_name='destination__code', lookup_expr='exact')
    date = filters.CharFilter(field_name='departure_date__date', lookup_expr='startswith',
                              label='Departure date')

    class Meta:
        model = Flight
        fields =('origin', 'destination', 'date')


class FlightPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class FlightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Flight.objects.all().select_related('origin', 'destination').order_by('departure_date')
    serializer_class = FlightSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = FlightFilterSet
    pagination_class = FlightPagination


class DestinationAirportFilterSet(filters.FilterSet):
    origin = filters.CharFilter(field_name='arrivals__origin__code', distinct=True)

    class Meta:
        model = Airport
        fields = ['origin']


class OriginAirportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Airport.objects.exclude(departures__isnull=True).order_by('name')
    serializer_class = AirportSerializer


class DestinationAirportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Airport.objects.exclude(arrivals__isnull=True).order_by('name')
    serializer_class = AirportSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = DestinationAirportFilterSet


class FlightDatesFilterSet(filters.FilterSet):
    origin = filters.CharFilter(field_name='origin__code', lookup_expr='exact')
    destination = filters.CharFilter(field_name='destination__code', lookup_expr='exact')


class FlightDatesViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = (Flight.objects.all()
                .annotate(date=F('departure_date__date'))
                .values('date', 'availabilities').order_by('date').distinct())
    serializer_class = FlightDateSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = FlightDatesFilterSet


class ContactViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class UserFilterBackend(rest_filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(user=request.user)


class AvailabilityNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    queryset = AvailabilityNotification.objects.all()
    serializer_class = AvailabilityNotificationSerializer
    filter_backends = [UserFilterBackend]

    def create(self, request, *args, **kwargs):
        user: User = request.user
        if user.notifications.count() == user.alerts_limit:
            raise APIException({"reason": "MAX ammount of alets reached"})
        # request.data['user'] = request.user.id
        request.data['destination_id'] = request.data['destination']
        request.data['origin_id'] = request.data['origin']
        return super().create(request, *args, **kwargs)


class UserViewSet(views.UserViewSet):
    @action(detail=False, methods=['POST'])
    def checkout_session(self, request):
        user = request.user
        customer = Customer.objects.get(subscriber=user)
        price = Price.objects.filter(active=True, recurring__interval=request.data['interval']).last()
        metadata = {
            f"{djstripe_settings.djstripe_settings.SUBSCRIBER_CUSTOMER_KEY}": user.id
        }
        session = stripe.checkout.Session.create(
            customer=customer.id,
            metadata=metadata,
            mode='subscription',
            line_items=[{
                'price': price.id,
                'quantity': 1,
            }],
            success_url=f"https://{settings.DOMAIN}/checkout_result?session_id={{CHECKOUT_SESSION_ID}}"
        )
        data = {
            'session_id': session.id,
            'session_url': session.url
        }
        return Response(data)
    
    @action(detail=True, methods=['GET'])
    def session_result(self, request, id):
        session_id = request.query_params.get('session_id')
        if not session_id:
            raise APIException({"reason": "Invalid Request"})
        session = Session.objects.filter(id=session_id, customer__subscriber=request.user).last()
        if not session:
            raise APIException({"reason": "Invalid Request"})
        data = {
            'session_status': session.status,
            'session_payment_status': session.payment_status
        }
        return Response(data)
        

class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = SubscriptionPlanSerializer
