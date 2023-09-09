"""
Flights app viewsets
"""
import logging
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
from djstripe.models import (
    Customer,
    Plan,
    Price,
    Session
)
from djstripe import settings as djstripe_settings

from flight_rewards.flights import NOTIFICATION_STATUS
from flight_rewards.flights.models import (
    Airport,
    Contact,
    AvailabilityNotification,
    User,
    Flight
)
from flight_rewards.flights.serializers import (
    AirportSerializer,
    ContactSerializer,
    AvailabilityNotificationSerializer,
    SubscriptionPlanSerializer,
    FlightDepartureDateSerializer,
    FlightSerializer,
    CurrentUserSerializer
)

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


class UserViewSet(views.UserViewSet):

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = CurrentUserSerializer(instance)
        return Response(serializer.data)

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

    @action(detail=True, methods=['POST'])
    def cancel_subscription(self, request, id=None):
        user = self.get_object()  # Get the user instance based on the id passed in the URL
        customer = Customer.objects.get(subscriber=user)

        subscription = customer.valid_subscriptions.order_by('created').last()
        if not subscription:
            return Response({"error": "No active subscription found for this user"},
                            status=status.HTTP_400_BAD_REQUEST)

        # Cancel the subscription using dj-stripe
        subscription_obj = subscription.api_retrieve()  # Get the stripe object
        subscription_obj.cancel_at_period_end = True  # Set the flag
        updated_subscription = subscription_obj.save()  # Save the update

        # Check the response
        if updated_subscription.cancel_at_period_end:
            return Response({"success": "Subscription will be cancelled at the end of the current period"})
        else:
            return Response({"error": "Failed to schedule subscription cancellation"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = SubscriptionPlanSerializer


class AvailabilityNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = AvailabilityNotificationSerializer
    filter_backends = [UserFilterBackend]

    def get_queryset(self):
        return AvailabilityNotification.objects.filter(status=NOTIFICATION_STATUS.PENDING.value)

    def create(self, request, *args, **kwargs):
        user: User = request.user
        # Count only "pending" notifications
        if user.notifications.filter(status=NOTIFICATION_STATUS.PENDING.value).count() >= user.alerts_limit:
            raise APIException({"reason": "MAX amount of alerts reached"})

        mutable_data = request.data.copy()  # Create a mutable copy
        mutable_data['user'] = user.id  # Set the user id

        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class NotificationJobViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = AvailabilityNotification.objects.filter(status=NOTIFICATION_STATUS.PENDING)
        # Serialize the data into the format you want
        serialized_data = []
        for notification in queryset:
            serialized_data.append({
                'id': notification.id,  # Include the ID
                'Name': notification.user.first_name,
                'Surname': notification.user.last_name,
                'Email': notification.user.email,
                'Departure Air': notification.origin.code,
                'Destination Air': notification.destination.code,
                'Start Date': notification.start_date,
                'End Date': notification.end_date,
                'Cabin': ','.join(notification.flight_classes),
                'Status': notification.status
            })

        return Response(serialized_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def update_status(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Filter notifications by IDs and update their status
        AvailabilityNotification.objects.filter(id__in=ids).update(status=NOTIFICATION_STATUS.SENT)

        return Response({'message': 'Status updated successfully'}, status=status.HTTP_200_OK)
