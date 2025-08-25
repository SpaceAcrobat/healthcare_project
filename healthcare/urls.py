from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    # Requests to /admin/ go to the Django admin site
    path('admin/', admin.site.urls),
    
    # CRITICAL: Requests starting with /api/ are sent to your api/urls.py file
    path('api/', include('api.urls')),
    
    # Any other request will serve your main index.html file
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]
