#!/bin/sh


echo "Waiting for postgres..."

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Running migrate..."
python manage.py migrate
echo "Migration completed successfully."
echo "Running command for filling known airports static files..."
echo "Importing airports from 'flight_rewards/flights/fixtures/airport_codes.csv'..."
python manage.py import_airports "flight_rewards/flights/fixtures/airport_codes.csv"
echo "Airports imported successfully."

echo "Importing flights from 'flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_FCO_2023-08-11_2pax.csv'..."
python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_FCO_2023-08-11_2pax.csv"
python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_LAX_2023-08-16_2pax.csv"
python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_LHR_2023-08-17_2pax.csv"
echo "Flights imported successfully."

echo "Starting the application..."
exec "$@"
