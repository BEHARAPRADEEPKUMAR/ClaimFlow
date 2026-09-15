from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        (
            "ClaimFlow Information",
            {
                "fields": (
                    "role",
                    "department",
                    "monthly_limit",
                    "manager",
                    "avatar",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "ClaimFlow Information",
            {
                "fields": (
                    "role",
                    "department",
                    "monthly_limit",
                    "manager",
                    "avatar",
                )
            },
        ),
    )

    def formfield_for_foreignkey(
        self,
        db_field,
        request,
        **kwargs
    ):

        if db_field.name == "manager":

            kwargs["queryset"] = User.objects.filter(
                role=User.Role.MANAGER
            )

        return super().formfield_for_foreignkey(
            db_field,
            request,
            **kwargs
        )