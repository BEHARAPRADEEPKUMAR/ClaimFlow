from django.contrib import admin

from .models import Approval


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):

    list_display = (
        "claim",
        "manager",
        "action",
        "created_at",
    )

    list_filter = (
        "action",
    )