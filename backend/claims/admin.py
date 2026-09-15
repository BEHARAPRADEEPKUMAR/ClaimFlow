from django.contrib import admin

from .models import ExpenseClaim


@admin.register(ExpenseClaim)
class ExpenseClaimAdmin(admin.ModelAdmin):

    list_display = (
        "claim_number",
        "employee",
        "merchant",
        "amount",
        "category",
        "status",
        "duplicate_flag",
        "created_at",
    )

    list_filter = (
        "status",
        "category",
        "duplicate_flag",
    )

    search_fields = (
        "claim_number",
        "merchant",
        "employee__username",
    )