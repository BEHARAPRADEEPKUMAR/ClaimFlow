from django.contrib import admin

from .models import MonthlyBudget, AuditLog


@admin.register(MonthlyBudget)
class MonthlyBudgetAdmin(admin.ModelAdmin):

    list_display = (
        "employee",
        "month",
        "limit",
        "spent",
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "claim",
        "action",
        "created_at",
    )