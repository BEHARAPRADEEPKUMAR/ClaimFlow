from django.urls import path

from .views import (
    FinanceDashboardView,
    ReadyToPayView,
    PaymentListView,
    ProcessPaymentView,
)


urlpatterns = [

    path(
        "dashboard/",
        FinanceDashboardView.as_view(),
        name="finance-dashboard",
    ),

    path(
        "ready-to-pay/",
        ReadyToPayView.as_view(),
        name="ready-to-pay",
    ),

    path(
        "",
        PaymentListView.as_view(),
        name="payment-list",
    ),

    path(
        "<int:pk>/pay/",
        ProcessPaymentView.as_view(),
        name="process-payment",
    ),
]