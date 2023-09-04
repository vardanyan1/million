import os
import pytz
import smtplib
import requests
import pandas as pd
from datetime import datetime

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Sender's credentials
sender_email = 'sargisgyan@gmail.com'
password = '****'

# Authentication credentials
auth_email = "***"
auth_pass = "***"

BASE_URL = "http://170.64.192.200/"
API_BASE_URL = BASE_URL + 'api/api/'


def authenticate(email, password):
    response = requests.post(
        f"{API_BASE_URL}jwt/create/",
        data={
            'email': email,  # Assuming you're using email for authentication
            'password': password
        }
    )
    response.raise_for_status()
    return response.json()['access']



def fetch_pending_notifications(token):
    headers = {
        'Authorization': f"Bearer {token}"
    }
    response = requests.get(f"{API_BASE_URL}alert_job/", headers=headers)
    response.raise_for_status()
    return response.json()


def update_notification_status(token, ids):
    headers = {
        'Authorization': f"Bearer {token}"
    }
    response = requests.post(
        f"{API_BASE_URL}alert_job/update_status/",
        headers=headers,
        json={'ids': ids}
    )
    response.raise_for_status()
    return response.json()


def extract_flight_details_for_alert(notification):
    results = []

    # Get today's date for constructing the filename
    sydney_timezone = pytz.timezone('Australia/Sydney')
    today_date = datetime.now(sydney_timezone).date().strftime('%Y-%m-%d')

    # Construct the CSV filename using details from the current user
    csv_filename = f"Reward_Seats_VAustralia_{notification['Departure Air']}_{notification['Destination Air']}_{today_date}_2pax.csv"
    full_csv_path = os.path.join(os.getcwd(), csv_filename)  # Assuming the CSV is in the current working directory

    try:
        # Read the CSV file to extract flight details
        flight_data = pd.read_csv(full_csv_path)
        # Filter out excluded routes
        flight_data = filter_excluded_routes(flight_data, notification['Departure Air'], notification['Destination Air'])

        # Splitting the Cabin Type for the current user and filtering the flights
        user_cabin_types = notification['Cabin'].split(',')
        flight_data['First Departure Date'] = flight_data['Departure Date'].str.split(',').str[0]

        matching_flights = flight_data[
            (flight_data['First Departure Date'] >= notification['Start Date']) &
            (flight_data['First Departure Date'] <= notification['End Date']) &
            (flight_data['Designated Class'].isin(user_cabin_types))
            ]
        for idx, flight_row in matching_flights.iterrows():
            result_row = notification
            for col in flight_data.columns:
                result_row[col] = flight_row[col]
            results.append(result_row)
    except FileNotFoundError:
        pass
    return pd.DataFrame(results)


routes_rules_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8MTdH16fquuAJQEoB_PTeU2AldNtXDBLixAZ81P8Hi90pQZTuo-i7uqQuOHfwUzu5xFuBvlhQ3nLG/pub?gid=1731406569&single=true&output=csv"
# Load the Routes & Rules CSV
exclusions_df = pd.read_csv(routes_rules_url)  # Routes & Rules google sheet tab

def filter_excluded_routes(flight_data, departure, arrival):
    # Fetch the exclusion routes for the specific departure and arrival
    exclusion_routes = exclusions_df[
        (exclusions_df["Departure"] == departure) &
        (exclusions_df["Arrival"] == arrival)
        ]["Route Exclusions"].tolist()

    # If there are any exclusion routes for this departure and arrival
    if exclusion_routes:
        # Convert the string of routes into a list of routes
        excluded_routes = exclusion_routes[0].split(', ')

        # Filter out the flights with excluded routes
        for route in excluded_routes:
            flight_data = flight_data[~flight_data['Connection Airport Codes'].str.contains(route, na=False)]

    return flight_data

# Reading the Airport codes from Google Sheets link
airport_codes_sheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8MTdH16fquuAJQEoB_PTeU2AldNtXDBLixAZ81P8Hi90pQZTuo-i7uqQuOHfwUzu5xFuBvlhQ3nLG/pub?output=csv"
airport_codes_table = pd.read_csv(airport_codes_sheet, usecols=['Airport Code(s)', 'Airport Name(s)'])

# Mapping airport codes to airport names
airp_codes_dic = airport_codes_table.set_index('Airport Code(s)').T.to_dict('list')

def map_code_to_airport_name(airport_code, airport_codes_dic):
    """Function to map airport code to its name"""
    return airport_codes_dic.get(airport_code, [airport_code])[0]


def send_mail(receiver_email, flight_details, sender_email, password):
    """Function to send the flight alert email"""

    msg = MIMEMultipart()

    # Mapping the airport codes to their respective names
    departure_airport_name = map_code_to_airport_name(flight_details['Departure Air'].iloc[0], airp_codes_dic)
    destination_airport_name = map_code_to_airport_name(flight_details['Destination Air'].iloc[0], airp_codes_dic)

    # Creating the route for the email subject and body
    route = f"{departure_airport_name} ({flight_details['Departure Air'].iloc[0]}) to {destination_airport_name} ({flight_details['Destination Air'].iloc[0]})"
    msg['Subject'] = f'ALERT: New reward seat availability for {route}'
    msg['From'] = sender_email
    msg['To'] = receiver_email

    # Formatting dates and classes
    flight_details['Formatted Date'] = pd.to_datetime(flight_details['First Departure Date']).dt.strftime('%d/%m/%Y')
    class_order = ["Economy", "PremiumEconomy", "Business", "First"]
    grouped_dates = flight_details.groupby('Formatted Date')['Designated Class'].unique().to_dict()
    sorted_grouped_dates = dict(sorted(grouped_dates.items(), key=lambda item: datetime.strptime(item[0], '%d/%m/%Y')))
    outbound_dates_list = []
    for date, classes in sorted_grouped_dates.items():
        sorted_classes = sorted(classes, key=lambda x: class_order.index(x))
        outbound_dates_list.append(f"&nbsp;&nbsp;&nbsp;&nbsp;{date} {', '.join(sorted_classes)}")

    # Constructing the email body
    greeting = f"Hi {flight_details['Name'].iloc[0]},"
    intro_text = "We've found reward seats that match your alert criteria:"
    start_date = datetime.strptime(flight_details['Start Date'].iloc[0], '%Y-%m-%d').strftime('%d/%m/%Y')
    end_date = datetime.strptime(flight_details['End Date'].iloc[0], '%Y-%m-%d').strftime('%d/%m/%Y')
    travel_dates = f"- Alert Date Range: {start_date} - {end_date}"
    selected_classes = f"- Selected Class(es): {flight_details['Cabin'].iloc[0].replace(',', ', ')}"
    outbound_dates_text = "- Outbound Dates:<br>" + '<br>'.join(outbound_dates_list)
    info_availability = "Note - availability changes quickly! View these available flights on Classic Flight Rewards and see if the itinerary works for your travel plans."
    login_link = BASE_URL + "/login"
    beaware = "You won't be notified of this alert across this date range again. Login to manage your alerts."
    website_link = "ClassicFlightRewards.com"

    body = f"{greeting}<br><br>{intro_text}<br><br>{route}<br>{travel_dates}<br>{selected_classes}<br><br>{outbound_dates_text}<br><br>{info_availability}<br><br>{login_link}<br><br>{beaware}<br><br>{website_link}"
    msgText = MIMEText(body, 'html')
    msg.attach(msgText)

    # Sending the email
    try:
        with smtplib.SMTP('smtp.gmail.com', '587') as smtpObj:
            smtpObj.ehlo()
            smtpObj.starttls()
            smtpObj.login(sender_email, password)
            smtpObj.sendmail(sender_email, receiver_email, msg.as_string())
    except Exception as e:
        print(e)


def send_flight_details_to_users(token, sender_email, password):
    notifications = fetch_pending_notifications(token)

    for notification in notifications:
        # Extract flight details for the current user
        flight_details_df = extract_flight_details_for_alert(notification)

        # If there are matching flights, send an email to the user
        if not flight_details_df.empty:
            send_mail(notification['Email'], flight_details_df, sender_email, password)
            print(f"Email sent to {notification['Email']} with flight details!")
            # Gather the IDs of notifications you processed
            ids_to_update = [notification['id']]
            update_notification_status(token, ids_to_update)
        else:
            print(f"No matching flights found for {notification['Name']} {notification['Surname']}. No email sent.")


# Authenticate and send details
token = authenticate(auth_email, auth_pass)
send_flight_details_to_users(token, sender_email, password)
