from django.shortcuts import render

def api_tester_view(request):
    """
    A simple view that renders the api_tester.html template.
    """
    return render(request, 'api_tester.html')
