
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from flight_rewards.flights.models import User
from djstripe.models import Customer, Price


class CheckoutSessionTests(APITestCase):
    def setUp(self):
        # Create a test user and set up necessary Stripe objects like Price
        self.user = User.objects.create(username='testuser', email='test@example.com')
        self.customer = Customer.objects.create(subscriber=self.user)
        self.price = Price.objects.create(active=True, recurring__interval='monthly') # Set appropriate fields
        self.url = reverse('user-checkout-session')

    def test_create_checkout_session(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {'interval': 'monthly'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('session_id', response.data)

    def test_checkout_session_unauthenticated(self):
        response = self.client.post(self.url, {'interval': 'monthly'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

