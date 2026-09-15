from django.urls import path

from .views import (
    CategorySpendingView,
    MonthlySpendingView,
    EmployeeSpendingView,
    BudgetOverviewView,
)


urlpatterns = [

    path(
        "categories/",
        CategorySpendingView.as_view(),
    ),

    path(
        "monthly/",
        MonthlySpendingView.as_view(),
    ),

    path(
        "employees/",
        EmployeeSpendingView.as_view(),
    ),

    path(
        "budgets/",
        BudgetOverviewView.as_view(),
    ),

]