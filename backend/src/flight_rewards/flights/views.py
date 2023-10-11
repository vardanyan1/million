import logging
from io import TextIOWrapper

from django.shortcuts import redirect, render
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect

from flight_rewards.flights.forms import UploadFileForm
from flight_rewards.flights.services import import_flights_from_csv

# Configure logging
logger = logging.getLogger(__name__)


@csrf_protect
def upload_flights(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            file = request.FILES['file']
            try:
                import_flights_from_csv(TextIOWrapper(file, encoding='utf-8'))
                messages.success(request, 'Successfully Uploaded new Flights Data.')
            except Exception as exc:
                logger.error("An error occurred while importing flights: %s", exc)
                messages.error(request, f'Error Uploading Data, keeping the old one. Details: {exc}')
            return redirect('upload_result')
    else:
        form = UploadFileForm()
    return render(request, 'upload_flights.html', {'form': form})


@csrf_protect
def upload_result(request):
    return render(request, 'upload_result.html')
