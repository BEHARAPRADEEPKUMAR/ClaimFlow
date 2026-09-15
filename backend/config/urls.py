from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from .views import health_check


urlpatterns = [
    path("admin/", admin.site.urls),

    # Health check
    path("", health_check, name="health-check"),

    # Authentication
    path("api/auth/", include("accounts.urls")),

    # Claims
    path("api/", include("claims.urls")),

    # Approvals
    path("api/approvals/", include("approvals.urls")),

    # Finance
    path("api/finance/", include("payments.urls")),

    # Analytics
    path("api/analytics/", include("analytics.urls")),
]


# Serve uploaded bills/receipts during development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )