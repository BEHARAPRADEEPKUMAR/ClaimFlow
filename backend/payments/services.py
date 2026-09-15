import uuid

from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone

from claims.models import ExpenseClaim
from analytics.models import AuditLog

from .models import Payment


class PaymentService:

    @staticmethod
    @transaction.atomic
    def process_payment(claim, finance_user):

        # -----------------------------------------
        # 1. Finance permission
        # -----------------------------------------

        if finance_user.role != "FINANCE":

            raise PermissionDenied(
                "Only Finance users can process payments."
            )


        # -----------------------------------------
        # 2. Claim must be approved
        # -----------------------------------------

        if claim.status != ExpenseClaim.Status.APPROVED:

            raise ValueError(
                f"Only approved claims can be paid. "
                f"Current status: {claim.status}"
            )


        # -----------------------------------------
        # 3. Block duplicate claims
        # -----------------------------------------

        if claim.duplicate_flag:

            duplicate_number = (
                claim.duplicate_of.claim_number
                if claim.duplicate_of
                else "an existing claim"
            )

            raise ValueError(
                f"Payment blocked. This claim appears to be "
                f"a duplicate of {duplicate_number}."
            )


        # -----------------------------------------
        # 4. Prevent double payment
        # -----------------------------------------

        existing_payment = Payment.objects.filter(
            claim=claim
        ).first()


        if existing_payment:

            if existing_payment.status == Payment.Status.PAID:

                raise ValueError(
                    "This claim has already been paid."
                )

            raise ValueError(
                "A payment record already exists for this claim."
            )


        # -----------------------------------------
        # 5. Generate payment reference
        # -----------------------------------------

        payment_reference = (
            f"PAY-{uuid.uuid4().hex[:8].upper()}"
        )


        # -----------------------------------------
        # 6. Create payment
        # -----------------------------------------

        payment = Payment.objects.create(

            claim=claim,

            payment_reference=payment_reference,

            amount=claim.amount,

            payment_date=timezone.now().date(),

            status=Payment.Status.PAID,

            processed_by=finance_user,
        )


        # -----------------------------------------
        # 7. Mark claim as PAID
        # -----------------------------------------

        claim.status = ExpenseClaim.Status.PAID

        claim.paid_at = timezone.now()

        claim.save(
            update_fields=[
                "status",
                "paid_at",
                "updated_at",
            ]
        )


        # -----------------------------------------
        # 8. Audit log
        # -----------------------------------------

        AuditLog.objects.create(

            user=finance_user,

            claim=claim,

            action="PAYMENT_PROCESSED",

            description=(
                f"Payment {payment_reference} "
                f"processed for ₹{claim.amount}."
            ),
        )


        return payment