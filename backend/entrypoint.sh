#!/bin/sh

echo "Running migrate..."
python manage.py makemigrations
python manage.py migrate
echo "Running command for filling known airports static files..."
python manage.py import_airports "flight_rewards/flights/fixtures/airport_codes.csv"

# Start the application
exec "$@"
