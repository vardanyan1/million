#!/bin/sh

echo "Starting migration process..."
echo "Running migrate..."
migration_output=$(python manage.py migrate 2>&1)

if echo "$migration_output" | grep -q "No migrations to apply."; then
  echo "No migrations to apply. Skipping file uploads."
else
  echo "Migration completed successfully."
  echo "Running command for filling known airports static files..."
  echo "Importing airports from 'flight_rewards/flights/fixtures/airport_codes.csv'..."
  python manage.py import_airports "flight_rewards/flights/fixtures/airport_codes.csv"
  echo "Airports imported successfully."

  echo "Importing flights from 'flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_FCO_2023-08-11_2pax.csv'..."
  python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_FCO_2023-08-11_2pax.csv"
  echo "Flights imported successfully."
fi

echo "Starting the application..."
exec "$@"
