#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Running migrate..."
python manage.py migrate
echo "Migration completed successfully."

echo "Collecting Static files..."
python manage.py collectstatic --no-input

echo "Add Stripe keys..."
stripe_keys_status=$(python manage.py add_stripes_keys)
echo "$stripe_keys_status"

if echo "$stripe_keys_status" | grep -q "already exists"; then
  echo "Stripe keys already exist, skipping further operations."
else
  echo "Stripe keys added successfully."
  echo "Synchronizing Stripe models..."
  python manage.py djstripe_sync_models
  echo "Stripe models synchronized successfully."

  echo "Creating superuser..."
  admin_status=$(python manage.py create_admin)
  echo "Superuser status: $admin_status"

  echo "Importing airports from 'flight_rewards/flights/fixtures/airport_codes.csv'..."
  python manage.py import_airports "flight_rewards/flights/fixtures/airport_codes.csv"
  echo "Airports imported successfully."

  echo "Importing flights"
  python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_FCO_2023-08-11_2pax.csv"
  python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_LAX_2023-08-16_2pax.csv"
  python manage.py import_flights "flight_rewards/flights/fixtures/Reward_Seats_VAustralia_SYD_LHR_2023-08-17_2pax.csv"
  python manage.py import_flights "flight_rewards/flights/fixtures/VAustralia_SYD_AMS_2023-08-06_2pax.csv"
  echo "Flights imported successfully."
fi

echo "Starting the application..."
exec "$@"
