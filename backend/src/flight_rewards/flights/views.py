from io import TextIOWrapper

from django.http import HttpResponseRedirect
from django.shortcuts import render

from flight_rewards.flights.forms import UploadFileForm
from flight_rewards.flights.services import import_flights


def upload_flights(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            file = request.FILES['file']
            try:
                import_flights(TextIOWrapper(file, encoding='utf-8'))
                success = True
            except Exception as exc:
                print(exc)
                success = False
            return HttpResponseRedirect(f'/flights/upload_result?success={str(success).lower()}')
    else:
        form = UploadFileForm()
    return render(request, 'upload_flights.html', {'form': form})

def upload_result(request):
    success = request.GET.get('success', 'true')
    return render(request, 'upload_result.html', { 'success': success == 'true' })
