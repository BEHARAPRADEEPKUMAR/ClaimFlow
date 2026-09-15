from django.core.exceptions import PermissionDenied

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from claims.models import ExpenseClaim
from claims.serializers import ExpenseClaimSerializer
from .models import Payment
from .services import PaymentService
from .serializers import PaymentSerializer


class FinanceDashboardView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "detail":
                    "Only Finance users can access this dashboard."
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        approved = ExpenseClaim.objects.filter(
            status=ExpenseClaim.Status.APPROVED
        )

        paid = ExpenseClaim.objects.filter(
            status=ExpenseClaim.Status.PAID
        )

        duplicate_count = ExpenseClaim.objects.filter(
            duplicate_flag=True
        ).count()


        return Response({

            "total_spend": sum(
                claim.amount
                for claim in paid
            ),

            "pending_approval": ExpenseClaim.objects.filter(
                status__in=[
                    ExpenseClaim.Status.SUBMITTED,
                    ExpenseClaim.Status.UNDER_REVIEW,
                ]
            ).count(),

            "ready_to_pay": approved.count(),

            "paid_count": paid.count(),

            "pending_count": ExpenseClaim.objects.filter(
                status__in=[
                    ExpenseClaim.Status.SUBMITTED,
                    ExpenseClaim.Status.UNDER_REVIEW,
                    ExpenseClaim.Status.APPROVED,
                ]
            ).count(),

            "duplicate_count": duplicate_count,
        })


class ReadyToPayView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "detail":
                    "Only Finance users can access this page."
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        claims = (
            ExpenseClaim.objects
            .select_related(
                "employee",
                "duplicate_of",
            )
            .filter(
                status=ExpenseClaim.Status.APPROVED,
                employee__role__in=[
                    "EMPLOYEE",
                    "MANAGER",
                ],
            )
            .order_by("-approved_at")
        )


        serializer = ExpenseClaimSerializer(
            claims,
            many=True,
            context={"request": request},
        )


        return Response(
            serializer.data
        )


class PaymentListView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "detail":
                    "Only Finance users can access payments."
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        payments = (
            Payment.objects
            .select_related(
                "claim",
                "claim__employee",
                "processed_by",
            )
            .order_by("-created_at")
        )


        serializer = PaymentSerializer(
            payments,
            many=True,
        )


        return Response(
            serializer.data
        )


class ProcessPaymentView(APIView):

    permission_classes = [IsAuthenticated]


    def post(self, request, pk):

        if request.user.role != "FINANCE":

            return Response(
                {
                    "detail":
                    "Only Finance users can process payments."
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        try:

            claim = ExpenseClaim.objects.select_related(
                "employee",
                "duplicate_of",
            ).get(pk=pk)

        except ExpenseClaim.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Claim not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )


        try:

            payment = PaymentService.process_payment(
                claim=claim,
                finance_user=request.user,
            )


            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_200_OK,
            )


        except PermissionDenied as exc:

            return Response(
                {
                    "detail": str(exc)
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        except ValueError as exc:

            return Response(
                {
                    "detail": str(exc)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        except Exception as exc:

            # Important during development:
            # return actual error to frontend
            print(
                "PAYMENT ERROR:",
                repr(exc)
            )

            return Response(
                {
                    "detail":
                    f"Payment processing failed: {str(exc)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )