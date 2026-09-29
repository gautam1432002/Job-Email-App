from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is alive!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check),
    path('api/v1/', include('mailer.api_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
