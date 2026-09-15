from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth

from claims.models import ExpenseClaim


def get_category_spending():

    queryset = (
        ExpenseClaim.objects
        .filter(
            status=ExpenseClaim.Status.PAID
        )
        .values(
            "category"
        )
        .annotate(
            total=Sum("amount")
        )
        .order_by("-total")
    )

    return list(queryset)


def get_monthly_spending():

    queryset = (
        ExpenseClaim.objects
        .filter(
            status=ExpenseClaim.Status.PAID
        )
        .annotate(
            month=TruncMonth("expense_date")
        )
        .values("month")
        .annotate(
            total=Sum("amount")
        )
        .order_by("month")
    )

    return list(queryset)


def get_employee_spending():

    queryset = (
        ExpenseClaim.objects
        .filter(
            status=ExpenseClaim.Status.PAID
        )
        .values(
            "employee",
            "employee__first_name",
            "employee__last_name",
        )
        .annotate(
            total=Sum("amount")
        )
        .order_by("-total")
    )

    return list(queryset)