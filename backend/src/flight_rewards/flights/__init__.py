import enum


class SUBSCRIPTION_TYPE(enum.StrEnum):
  FREE = 'FREE'
  MONTHLY = 'MONTHLY'
  ANNUAL = 'ANNUAL'


class MAX_ALERTS_PER_SUBSCRIPTION(enum.IntEnum):
    FREE = 0
    MONTHLY = 10
    ANNUAL = 100


class NOTIFICATION_STATUS(enum.StrEnum):
    PENDING = 'Pending'
    SENT = 'Sent'
    FAILED = 'Failed'


class FLIGHT_CLASSES(enum.StrEnum):
    ECONOMY = 'Economy'
    PREMIUM_ECONOMY = 'PremiumEconomy'
    BUSINESS = 'Business'
    FIRST = 'First'


class PREFERRED_PROGRAMS(enum.StrEnum):
    VA = 'Virgin Velocity'
    QF = 'Qantas FF'
