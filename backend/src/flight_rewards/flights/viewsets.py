"""
Flights app viewsets
"""
import stripe

from django.db.models import Min, Q, Func
from django.conf import settings
from django.db.models.functions import TruncDate

from django_filters import rest_framework as filters
from rest_framework import viewsets, mixins, filters as rest_filters, status
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


from django.db.models.functions import TruncDate


class FlightViewSet(viewsets.ModelViewSet):
    serializer_class = FlightSerializer
    pagination_class = CustomFlightPagination

    def get_queryset(self):
        queryset = Flight.objects.annotate(
            flight_start_date_trunc=TruncDate('flight_start_date')
        ).order_by('flight_start_date_trunc')

        # Date filter
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(flight_start_date_trunc=date)

        # Origin and Destination filter
        origin = self.request.query_params.get('origin', None)
        destination = self.request.query_params.get('destination', None)

        if origin:
            queryset = queryset.filter(origin__code=origin)

        if destination:
            queryset = queryset.filter(destination__code=destination)

        return queryset


class TruncDate(Func):
    function = 'DATE'


class FlightDepartureDatesViewSet(viewsets.ViewSet):
    """
    A ViewSet for listing distinct first departure dates for flights along with available designated classes.
    """

    def list(self, request):
        # Apply filters for origin and destination if provided
        queryset = Flight.objects.all()
        origin = request.GET.get('origin', None)
        destination = request.GET.get('destination', None)

        if origin:
            queryset = queryset.filter(origin__code=origin)

        if destination:
            queryset = queryset.filter(destination__code=destination)

        # Annotate each Flight with the earliest departure_date truncated to date from related FlightDetail
        flights_with_earliest_date = queryset.annotate(
            first_departure_date=TruncDate(Min('details__departure_date'))
        ).values('first_departure_date', 'class_details__designated_class')

        # Create a dictionary to store the departure dates and their respective designated classes
        date_class_dict = {}
        for flight in flights_with_earliest_date:
            date = flight['first_departure_date']
            if date:
                designated_class = flight['class_details__designated_class']
                if date not in date_class_dict:
                    date_class_dict[date] = []
                if designated_class:
                    date_class_dict[date].append(designated_class)

        # Convert the data to a list of dictionaries
        date_class_list = [{"departure_date": key, "designated_classes": list(set(value))}
                            for key, value in date_class_dict.items()]

        serializer = FlightDepartureDateSerializer(data=date_class_list, many=True)
        serializer.is_valid(raise_exception=True)
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
