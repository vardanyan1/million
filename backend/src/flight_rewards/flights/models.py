import enum

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_extensions.db.models import TimeStampedModel
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from djstripe.models import Customer
from djstripe.enums import PlanInterval

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class SUBSCRIPTION_TYPE(enum.StrEnum):
  FREE = 'FREE'
  MONTHLY = 'MONTHLY'
  ANNUAL = 'ANNUAL'

class MAX_ALERTS_PER_SUBSCRIPTION(enum.IntEnum):
    FREE = 0
    MONTHLY = 10
    ANNUAL = 100


class User(AbstractUser):
    username = None
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    @property
    def subscription(self):
        customer = Customer.objects.get(subscriber=self)
        last_subscription = customer.valid_subscriptions.order_by('created').last()
        if last_subscription:
            if last_subscription.plan.interval == PlanInterval.month:
                return SUBSCRIPTION_TYPE.MONTHLY
            elif last_subscription.plan.interval == PlanInterval.year:
                return SUBSCRIPTION_TYPE.ANNUAL
            
        return SUBSCRIPTION_TYPE.FREE
    
    @property
    def alerts_limit(self):
        return MAX_ALERTS_PER_SUBSCRIPTION[self.subscription]


    def __str__(self):
        return self.email


@receiver(post_save, sender=User)
def create_stripe_customer(sender, instance, created, **kwargs):
    if created:
        Customer.get_or_create(subscriber=instance)


# Create your models here.
class Airport(models.Model):
    code = models.CharField(max_length=50, null=False, blank=False)
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Flight(TimeStampedModel):
    class AwardsSource(models.TextChoices):
        QF = 'QF', 'Qantas'
        VA = 'VA', 'Virgin Australia'

    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="departures")
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="arrivals")
    connections = models.JSONField(default=list, null=False, blank=False)
    departure_date = models.DateTimeField(null=False, blank=False)
    availabilities = models.JSONField(default=list, null=False, blank=False)
    tax_per_adult = models.FloatField(null=False, blank=False)
    source = models.CharField(choices=AwardsSource.choices, null=False, blank=False, max_length=255)

    # New fields
    equipment = models.CharField(max_length=255, null=True, blank=True)
    remaining_seats = models.PositiveIntegerField(null=True, blank=True)
    designated_class = models.CharField(max_length=100, null=True, blank=True)
    RBD = models.CharField(max_length=50, null=True, blank=True)
    stop_overs = models.PositiveIntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.origin.name} ({self.origin.code}) - {self.destination.code} ({self.destination.name})"


class Contact(TimeStampedModel):
    first_name = models.CharField(max_length=255, null=False, blank=False)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    email = models.EmailField(max_length=255, null=False, blank=False)
    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="origin_interested")
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="destination_interested")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email}): {self.origin.name} - {self.destination.name}"


class AvailabilityNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="origin_notifications")
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name="destination_notifications")
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    flight_classes = models.JSONField(default=list, null=False, blank=False)
    preferred_programs = models.JSONField(default=list, null=False, blank=False)