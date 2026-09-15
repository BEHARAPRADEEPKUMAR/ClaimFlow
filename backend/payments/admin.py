from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "claim",
        "payment_reference",
        "amount",
        "status",
        "payment_date",
    )

    list_filter = (
        "status",
    )