"""
Flights app viewsets
"""
import stripe

from django.db.models import Min, Q
from django.conf import settings
from django_filters import rest_framework as filters
from rest_framework import viewsets, mixins, filters as rest_filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from djoser import views
from djstripe.models import Customer, Plan, Price, Session
from djstripe import settings as djstripe_settings

from flight_rewards.flights.models import Airport, Contact, AvailabilityNotification, User, Flight
from flight_rewards.flights.serializers import (
    AirportSerializer, ContactSerializer,
    AvailabilityNotificationSerializer, SubscriptionPlanSerializer, FlightDepartureDateSerializer, FlightSerializer
)


stripe.api_key = settings.STRIPE_TEST_SECRET_KEY


class DestinationAirportFilterSet(filters.FilterSet):
    origin = filters.CharFilter(field_name='arrival_flights__origin__code', distinct=True)

    class Meta:
        model = Airport
        fields = ['origin']


class OriginAirportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Airport.objects.filter(departure_flights__isnull=False).distinct().order_by('name')
    serializer_class = AirportSerializer


class DestinationAirportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Airport.objects.filter(Q(departure_flights__isnull=False)
                                      | Q(arrival_flights__isnull=False)).distinct().order_by('name')
    serializer_class = AirportSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = DestinationAirportFilterSet


class CustomFlightPagination(PageNumberPagination):
    page_size = 10


class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.annotate(first_departure_date=Min('details__departure_date')
                                       ).order_by('first_departure_date')
    serializer_class = FlightSerializer
    pagination_class = CustomFlightPagination


class FlightDepartureDatesViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for listing distinct first departure dates for flights.
    """

    def list(self, request):
        # Annotate each Flight with the earliest departure_date from related FlightDetail
        flights_with_earliest_date = Flight.objects.annotate(first_departure_date=Min('details__departure_date'))

        # Get dates excluding None values
        dates = flights_with_earliest_date.exclude(first_departure_date__isnull=True).values_list(
            'first_departure_date', flat=True).distinct()

        # Convert dates to a list of dictionaries for the serializer.
        dates_list = [{"departure_date": date} for date in dates]

        serializer = FlightDepartureDateSerializer(data=dates_list, many=True)
        serializer.is_valid(raise_exception=True)  # This will raise a 400 error if data is invalid
        return Response(serializer.data)


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
