"""
URL configuration for flight_rewards project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from flight_rewards.flights.viewsets import (
    OriginAirportViewSet,
    DestinationAirportViewSet,
    ContactViewSet,
    AvailabilityNotificationViewSet,
    UserViewSet,
    SubscriptionPlanViewSet,
    FlightDepartureDatesViewSet,
    FlightViewSet,
    NotificationJobViewSet)
from flight_rewards.flights.views import upload_flights, upload_result


class OptionalSlashDefaultRouter(routers.DefaultRouter):

    def __init__(self):
        super().__init__()
        self.trailing_slash = '/?'


router = OptionalSlashDefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'origins', OriginAirportViewSet, basename='origins')
router.register(r'destinations', DestinationAirportViewSet, basename='destinations')
router.register(r'flights', FlightViewSet, basename='flights')
router.register(r'flight-dates', FlightDepartureDatesViewSet, basename='flight-departure-dates')
router.register(r'contacts', ContactViewSet)
router.register(r'alerts', AvailabilityNotificationViewSet, basename='alerts')
router.register(r'alert_job', NotificationJobViewSet, basename='alert_job')
router.register(r'plans', SubscriptionPlanViewSet, basename='plans')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # path('api/', include('djoser.urls')),
    path('api/', include('djoser.urls.jwt')),
    path('api-auth/', include('rest_framework.urls')),
    path('flights/upload', upload_flights),
    path('flights/upload_result', upload_result),
    path('stripe/', include('djstripe.urls', namespace='djstripe'))
]
