from django.db import models


class Payment(models.Model):

    class Status(models.TextChoices):

        PENDING = "PENDING", "Pending"

        PROCESSING = "PROCESSING", "Processing"

        PAID = "PAID", "Paid"

        FAILED = "FAILED", "Failed"


    claim = models.OneToOneField(
        "claims.ExpenseClaim",
        on_delete=models.PROTECT,
        related_name="payment",
    )

    payment_reference = models.CharField(
        max_length=50,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    processed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="processed_payments",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):

        return self.payment_reference