import logging
from io import TextIOWrapper

from django.http import HttpResponseRedirect
from django.shortcuts import render

from flight_rewards.flights.forms import UploadFileForm
from flight_rewards.flights.services import import_flights

# Configure logging
logger = logging.getLogger(__name__)


def upload_flights(request):
    error_message = ''
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            file = request.FILES['file']
            try:
                import_flights(TextIOWrapper(file, encoding='utf-8'))
                success = True
            except Exception as exc:
                logger.error("An error occurred while importing flights: %s", exc)
                success = False
                error_message = str(exc)  # Capture the exception message
            return HttpResponseRedirect(f'/flights/upload_result?success={str(success).lower()}&error={error_message}')
    else:
        form = UploadFileForm()
    return render(request, 'upload_flights.html', {'form': form})


def upload_result(request):
    success = request.GET.get('success', 'true')
    error_message = request.GET.get('error', '')
    return render(request, 'upload_result.html', {'success': success == 'true', 'error_message': error_message})
