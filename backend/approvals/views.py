from django.core.exceptions import PermissionDenied
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from claims.models import ExpenseClaim
from claims.serializers import ExpenseClaimSerializer
from claims.services import (
    start_review,
    approve_claim,
    reject_claim,
)

from .models import Approval
from .serializers import ApprovalSerializer


# ============================================================
# APPROVAL LIST
# ============================================================

class ApprovalListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user


        # ----------------------------------------------------
        # MANAGER
        # ----------------------------------------------------

        if user.role == "MANAGER":

            claims = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "employee__manager",
                    "duplicate_of",
                )
                .filter(
                    employee__manager=user,
                    employee__role="EMPLOYEE",
                    status__in=[
                        ExpenseClaim.Status.SUBMITTED,
                        ExpenseClaim.Status.UNDER_REVIEW,
                    ],
                )
                .order_by("-submitted_at", "-created_at")
            )


        # ----------------------------------------------------
        # FINANCE
        # ----------------------------------------------------

        elif user.role == "FINANCE":

            claims = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "duplicate_of",
                )
                .filter(
                    employee__role="MANAGER",
                    status__in=[
                        ExpenseClaim.Status.SUBMITTED,
                        ExpenseClaim.Status.UNDER_REVIEW,
                    ],
                )
                .order_by("-submitted_at", "-created_at")
            )


        # ----------------------------------------------------
        # OTHER USERS
        # ----------------------------------------------------

        else:

            return Response(
                {
                    "detail":
                    "Only Managers and Finance users can access approvals."
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        serializer = ExpenseClaimSerializer(
            claims,
            many=True,
            context={
                "request": request
            },
        )


        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# START REVIEW
# ============================================================

class StartReviewView(APIView):

    permission_classes = [IsAuthenticated]


    @transaction.atomic
    def post(self, request, pk):

        try:

            claim = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "employee__manager",
                    "duplicate_of",
                )
                .get(pk=pk)
            )

        except ExpenseClaim.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Claim not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        try:

            claim = start_review(
                claim,
                request.user,
            )


            # IMPORTANT:
            # Pass request context so receipt_url
            # becomes an absolute URL.

            serializer = ExpenseClaimSerializer(
                claim,
                context={
                    "request": request
                },
            )


            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )


        except PermissionDenied as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        except ValueError as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# APPROVE CLAIM
# ============================================================

class ApproveClaimView(APIView):

    permission_classes = [IsAuthenticated]


    @transaction.atomic
    def post(self, request, pk):

        try:

            claim = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "employee__manager",
                    "duplicate_of",
                )
                .get(pk=pk)
            )

        except ExpenseClaim.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Claim not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        try:

            claim = approve_claim(
                claim,
                request.user,
            )


            comment = request.data.get(
                "comment",
                "",
            )


            approval = Approval.objects.create(

                claim=claim,

                manager=request.user,

                action=Approval.Action.APPROVED,

                comment=comment,
            )


            # IMPORTANT:
            # Pass request context here as well.

            serializer = ExpenseClaimSerializer(
                claim,
                context={
                    "request": request
                },
            )


            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )


        except PermissionDenied as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        except ValueError as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================================================
# REJECT CLAIM
# ============================================================

class RejectClaimView(APIView):

    permission_classes = [IsAuthenticated]


    @transaction.atomic
    def post(self, request, pk):

        try:

            claim = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "employee__manager",
                    "duplicate_of",
                )
                .get(pk=pk)
            )

        except ExpenseClaim.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Claim not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        comment = request.data.get(
            "comment",
            "",
        ).strip()


        if not comment:

            return Response(
                {
                    "detail":
                    "Rejection comment is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        try:

            claim = reject_claim(
                claim,
                request.user,
            )


            approval = Approval.objects.create(

                claim=claim,

                manager=request.user,

                action=Approval.Action.REJECTED,

                comment=comment,
            )


            # IMPORTANT:
            # Pass request context here too.

            serializer = ExpenseClaimSerializer(
                claim,
                context={
                    "request": request
                },
            )


            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )


        except PermissionDenied as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        except ValueError as exc:

            return Response(
                {
                    "detail":
                    str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )