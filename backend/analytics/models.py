from django.conf import settings
from django.db import models


class MonthlyBudget(models.Model):

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="monthly_budgets",
    )

    month = models.DateField()

    limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "month"],
                name="unique_employee_month_budget",
            )
        ]

    @property
    def remaining(self):
        return self.limit - self.spent

    @property
    def utilization_percentage(self):
        if self.limit == 0:
            return 0

        return (
            float(self.spent) /
            float(self.limit)
        ) * 100

    def __str__(self):
        return (
            f"{self.employee.username} - "
            f"{self.month}"
        )

class AuditLog(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_logs",
    )

    claim = models.ForeignKey(
        "claims.ExpenseClaim",
        on_delete=models.CASCADE,
        related_name="audit_logs",
        null=True,
        blank=True,
    )

    action = models.CharField(
        max_length=100,
    )

    description = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.action