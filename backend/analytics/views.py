from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MonthlyBudget
from .services import (
    get_category_spending,
    get_monthly_spending,
    get_employee_spending,
)


class CategorySpendingView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "error": (
                        "Only finance users can "
                        "access analytics."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            get_category_spending()
        )


class MonthlySpendingView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "error": (
                        "Only finance users can "
                        "access analytics."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            get_monthly_spending()
        )


class EmployeeSpendingView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "error": (
                        "Only finance users can "
                        "access analytics."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            get_employee_spending()
        )
        
        
class BudgetOverviewView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "error": (
                        "Only finance users can "
                        "access budgets."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        budgets = (
            MonthlyBudget.objects
            .select_related("employee")
            .all()
        )

        data = []

        for budget in budgets:

            utilization = (
                budget.utilization_percentage
            )

            data.append({
                "employee": (
                    budget.employee.get_full_name()
                    or budget.employee.username
                ),
                "month": budget.month,
                "limit": budget.limit,
                "spent": budget.spent,
                "remaining": budget.remaining,
                "utilization_percentage": round(
                    utilization,
                    2,
                ),
                "over_limit": (
                    budget.spent > budget.limit
                ),
            })

        return Response(data)