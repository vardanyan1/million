"""
Flights app viewsets
"""
import stripe

from django.db.models import Min
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
import logging

# Initialize logging
logger = logging.getLogger(__name__)


stripe.api_key = settings.STRIPE_TEST_SECRET_KEY


class DestinationAirportFilterSet(filters.FilterSet):
    origin = filters.CharFilter(field_name='arrival_flights__origin__code', distinct=True)

    class Meta:
        model = Airport
        fields = ['origin']


class OriginAirportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Airport.objects.filter(departure_flights__isnull=False).distinct().order_by('name')
    serializer_class = AirportSerializer


class DestinationAirportViewSet(viewsets.ViewSet):
    """
    A ViewSet for listing all distinct destination airports for a given origin.
    """

    def list(self, request):
        origin_code = request.GET.get('origin', None)

        if origin_code:
            # Fetch distinct destination airports for the given origin
            queryset = Flight.objects.filter(
                origin__code=origin_code
            ).values(
                'destination__id', 'destination__code', 'destination__name'
            ).distinct().order_by('destination__id')

            # Serialize and return the response
            data = []
            for record in queryset:
                data.append({
                    'id': record['destination__id'],
                    'code': record['destination__code'],
                    'name': record['destination__name'],
                })
            return Response(data)

        else:
            return Response({"error": "Origin code must be provided"}, status=status.HTTP_400_BAD_REQUEST)


class CustomFlightPagination(PageNumberPagination):
    page_size = 10


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
            date=TruncDate(Min('flight_start_date'))  # Assumed field, replace with your actual date field
        ).values('date', 'class_details__designated_class')  # Assumed relationship, replace with your actual field

        # Create a dictionary to store the departure dates and their respective designated classes
        date_class_dict = {}
        for flight in flights_with_earliest_date:
            date = flight['date']
            if date:
                designated_class = flight['class_details__designated_class']  # Assumed relationship, replace with your actual field
                if date not in date_class_dict:
                    date_class_dict[date] = []
                if designated_class:
                    date_class_dict[date].append(designated_class)

        # Convert the data to a list of dictionaries
        date_class_list = [{"date": key, "availabilities": list(set(value))}
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
        logger.info(f"Received request data: {request.data}")

        # Validate the request data
        interval = request.data.get('interval', 'month')  # Set to 'monthly' if not provided
        if not interval:
            print("Interval not provided, setting to 'month'")
            interval = 'month'

        price = Price.objects.filter(active=True, recurring__interval=interval).last()
        if not price:
            return Response({'error': 'Invalid interval or no active price found'}, status=status.HTTP_400_BAD_REQUEST)

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
            success_url=f"http://{settings.DOMAIN}/checkout_result?session_id={{CHECKOUT_SESSION_ID}}"
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
        session = Session.objects.filter(id=session_id)
        logger.debug(f"Sessions with session_id: {session}")
        session = session.filter(customer__subscriber=request.user).last()
        logger.debug(f"Session with customer__subscriber: {session}")

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
