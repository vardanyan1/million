import enum


class NOTIFICATION_STATUS(enum.StrEnum):
    PENDING = 'Pending'
    SENT = 'Sent'
    FAILED = 'Failed'


class FLIGHT_CLASSES(enum.StrEnum):
    ECONOMY = 'Economy'
    PREMIUM_ECONOMY = 'Premium Economy'
    BUSINESS = 'Business'
    FIRST = 'First'


class PREFERRED_PROGRAMS(enum.StrEnum):
    VA = 'Virgin Velocity'
    QF = 'Qantas FF'
