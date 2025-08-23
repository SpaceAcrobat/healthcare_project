from django.contrib import admin
from django.urls import path, include
from .views import api_tester_view # Make sure this line is here

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Make sure this line was added
    path('tester/', api_tester_view, name='api_tester'),
]