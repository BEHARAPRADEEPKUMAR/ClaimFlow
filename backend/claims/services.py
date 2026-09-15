from django.core.exceptions import PermissionDenied
from django.utils import timezone

from .models import ExpenseClaim


class ClaimService:

    @staticmethod
    def submit_claim(claim, user):
        if claim.employee_id != user.id:
            raise PermissionDenied(
                "You can only submit your own claims."
            )

        if claim.status != ExpenseClaim.Status.DRAFT:
            raise ValueError(
                "Only draft claims can be submitted."
            )

        claim.status = ExpenseClaim.Status.SUBMITTED
        claim.submitted_at = timezone.now()

        claim.save(
            update_fields=[
                "status",
                "submitted_at",
                "updated_at",
            ]
        )

        return claim

    @staticmethod
    def start_review(claim, reviewer):
        """
        Start review.

        Employee claim:
            Manager reviews.

        Manager claim:
            Finance reviews.
        """

        # -------------------------------------------------
        # Employee claim
        # -------------------------------------------------

        if claim.employee.role == "EMPLOYEE":

            if reviewer.role != "MANAGER":
                raise PermissionDenied(
                    "Only managers can review employee claims."
                )

            if claim.employee_id == reviewer.id:
                raise PermissionDenied(
                    "You cannot review your own claim."
                )

            if claim.employee.manager_id != reviewer.id:
                raise PermissionDenied(
                    "You can only review claims from your team."
                )

        # -------------------------------------------------
        # Manager claim
        # -------------------------------------------------

        elif claim.employee.role == "MANAGER":

            if reviewer.role != "FINANCE":
                raise PermissionDenied(
                    "Manager claims must be reviewed by Finance."
                )

        else:
            raise PermissionDenied(
                "This claim cannot be reviewed."
            )

        if claim.status != ExpenseClaim.Status.SUBMITTED:
            raise ValueError(
                "Only submitted claims can start review."
            )

        claim.status = ExpenseClaim.Status.UNDER_REVIEW

        claim.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return claim

    @staticmethod
    def approve_claim(claim, reviewer):
        """
        Approve claim.

        Employee claim:
            Manager approves.

        Manager claim:
            Finance approves.
        """

        # -------------------------------------------------
        # Employee claim
        # -------------------------------------------------

        if claim.employee.role == "EMPLOYEE":

            if reviewer.role != "MANAGER":
                raise PermissionDenied(
                    "Only managers can approve employee claims."
                )

            if claim.employee_id == reviewer.id:
                raise PermissionDenied(
                    "Managers cannot approve their own claims."
                )

            if claim.employee.manager_id != reviewer.id:
                raise PermissionDenied(
                    "You can only approve claims from your team."
                )

        # -------------------------------------------------
        # Manager claim
        # -------------------------------------------------

        elif claim.employee.role == "MANAGER":

            if reviewer.role != "FINANCE":
                raise PermissionDenied(
                    "Only Finance can approve manager claims."
                )

        else:
            raise PermissionDenied(
                "This claim cannot be approved."
            )

        if claim.status != ExpenseClaim.Status.UNDER_REVIEW:
            raise ValueError(
                "Claim must be under review before approval."
            )

        claim.status = ExpenseClaim.Status.APPROVED
        claim.approved_at = timezone.now()

        claim.save(
            update_fields=[
                "status",
                "approved_at",
                "updated_at",
            ]
        )

        return claim

    @staticmethod
    def reject_claim(claim, reviewer):
        """
        Reject claim.

        Employee claim:
            Manager rejects.

        Manager claim:
            Finance rejects.
        """

        # -------------------------------------------------
        # Employee claim
        # -------------------------------------------------

        if claim.employee.role == "EMPLOYEE":

            if reviewer.role != "MANAGER":
                raise PermissionDenied(
                    "Only managers can reject employee claims."
                )

            if claim.employee_id == reviewer.id:
                raise PermissionDenied(
                    "Managers cannot reject their own claims."
                )

            if claim.employee.manager_id != reviewer.id:
                raise PermissionDenied(
                    "You can only reject claims from your team."
                )

        # -------------------------------------------------
        # Manager claim
        # -------------------------------------------------

        elif claim.employee.role == "MANAGER":

            if reviewer.role != "FINANCE":
                raise PermissionDenied(
                    "Only Finance can reject manager claims."
                )

        else:
            raise PermissionDenied(
                "This claim cannot be rejected."
            )

        if claim.status != ExpenseClaim.Status.UNDER_REVIEW:
            raise ValueError(
                "Claim must be under review before rejection."
            )

        claim.status = ExpenseClaim.Status.REJECTED

        claim.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return claim

    @staticmethod
    def mark_paid(claim, finance_user):

        if finance_user.role != "FINANCE":
            raise PermissionDenied(
                "Only Finance users can process payments."
            )

        if claim.status != ExpenseClaim.Status.APPROVED:
            raise ValueError(
                "Only approved claims can be marked as paid."
            )

        claim.status = ExpenseClaim.Status.PAID
        claim.paid_at = timezone.now()

        claim.save(
            update_fields=[
                "status",
                "paid_at",
                "updated_at",
            ]
        )

        return claim


# ---------------------------------------------------------
# Compatibility wrappers
# ---------------------------------------------------------

def submit_claim(claim, user):
    return ClaimService.submit_claim(claim, user)


def start_review(claim, reviewer):
    return ClaimService.start_review(claim, reviewer)


def approve_claim(claim, reviewer):
    return ClaimService.approve_claim(claim, reviewer)


def reject_claim(claim, reviewer):
    return ClaimService.reject_claim(claim, reviewer)


def mark_paid(claim, finance_user):
    return ClaimService.mark_paid(claim, finance_user)