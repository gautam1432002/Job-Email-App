from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from django.db import connection

def health_check(request):
    db_status = "ok"
    try:
        connection.ensure_connection()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return JsonResponse({
        "status": "ok" if db_status == "ok" else "degraded",
        "message": "Backend is alive!",
        "database": db_status
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check),
    path('api/v1/', include('mailer.api_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
