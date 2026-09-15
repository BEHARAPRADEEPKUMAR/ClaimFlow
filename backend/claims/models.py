from django.conf import settings
from django.db import models
from django.utils import timezone


class ExpenseClaim(models.Model):

    class Category(models.TextChoices):
        TRAVEL = "TRAVEL", "Travel"
        MEALS = "MEALS", "Meals"
        SUPPLIES = "SUPPLIES", "Supplies"
        TAXI = "TAXI", "Taxi"
        ACCOMMODATION = "ACCOMMODATION", "Accommodation"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        PAID = "PAID", "Paid"

    claim_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="expense_claims",
    )

    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.OTHER,
    )

    merchant = models.CharField(
        max_length=255,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    expense_date = models.DateField()

    description = models.TextField()

    receipt_text = models.TextField(
        blank=True,
        default="",
    )

    # IMPORTANT:
    # Bill / receipt image is mandatory.
    receipt_image = models.FileField(
        upload_to="receipts/%Y/%m/",
        blank=False,
        null=False,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    ai_extracted = models.BooleanField(
        default=False,
    )

    ai_confidence = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    duplicate_flag = models.BooleanField(
        default=False,
    )

    duplicate_of = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="duplicate_claims",
    )

    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.claim_number} - {self.merchant} - ₹{self.amount}"

    def save(self, *args, **kwargs):

        # Generate claim number
        if not self.claim_number:
            last_claim = (
                ExpenseClaim.objects
                .order_by("-id")
                .first()
            )

            next_id = (
                (last_claim.id + 1)
                if last_claim
                else 1
            )

            self.claim_number = (
                f"CLM-{next_id:05d}"
            )

        # Protect PAID claims
        if self.pk:

            old_claim = (
                ExpenseClaim.objects
                .filter(pk=self.pk)
                .first()
            )

            if old_claim:

                if old_claim.status == self.Status.PAID:

                    protected_fields = [
                        "employee_id",
                        "category",
                        "merchant",
                        "amount",
                        "expense_date",
                        "description",
                        "receipt_text",
                        "receipt_image",
                    ]

                    for field in protected_fields:

                        old_value = getattr(
                            old_claim,
                            field,
                        )

                        new_value = getattr(
                            self,
                            field,
                        )

                        if old_value != new_value:
                            raise ValueError(
                                "Paid claims cannot be modified."
                            )

                    if self.status != self.Status.PAID:
                        raise ValueError(
                            "Paid claims cannot move backwards."
                        )

        super().save(*args, **kwargs)