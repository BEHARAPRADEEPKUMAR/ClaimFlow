from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .duplicate_detector import find_possible_duplicate
from .models import ExpenseClaim
from .receipt_extractor import extract_receipt_data
from .serializers import ExpenseClaimSerializer
from .services import ClaimService


class ExpenseClaimViewSet(ModelViewSet):

    serializer_class = ExpenseClaimSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "FINANCE":

            return (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "duplicate_of",
                )
                .all()
            )

        if user.role == "MANAGER":

            team_claims = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "duplicate_of",
                )
                .filter(
                    employee__manager=user
                )
            )

            own_claims = (
                ExpenseClaim.objects
                .select_related(
                    "employee",
                    "duplicate_of",
                )
                .filter(
                    employee=user
                )
            )

            return (
                team_claims |
                own_claims
            ).distinct()

        return (
            ExpenseClaim.objects
            .select_related(
                "employee",
                "duplicate_of",
            )
            .filter(
                employee=user
            )
        )

    def perform_create(self, serializer):

        claim = serializer.save(
            employee=self.request.user
        )

        duplicate_result = (
            find_possible_duplicate(
                claim
            )
        )

        if (
            duplicate_result
            and duplicate_result.get(
                "is_duplicate"
            )
        ):

            duplicate_claim = (
                duplicate_result.get(
                    "duplicate_of"
                )
            )

            if duplicate_claim:

                claim.duplicate_flag = True
                claim.duplicate_of = (
                    duplicate_claim
                )

                claim.save(
                    update_fields=[
                        "duplicate_flag",
                        "duplicate_of",
                        "updated_at",
                    ]
                )

    @action(
        detail=True,
        methods=["post"],
        url_path="submit",
    )
    def submit(
        self,
        request,
        pk=None,
    ):

        claim = self.get_object()

        # Mandatory bill check
        if not claim.receipt_image:

            return Response(
                {
                    "detail":
                        "Bill / receipt must be uploaded before submitting the claim."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            claim = (
                ClaimService.submit_claim(
                    claim,
                    request.user,
                )
            )

            serializer = (
                self.get_serializer(
                    claim
                )
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        except PermissionError as exc:

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

    @action(
        detail=False,
        methods=["post"],
        url_path="extract-receipt",
    )
    def extract_receipt(
        self,
        request,
    ):

        receipt_text = (
            request.data
            .get(
                "receipt_text",
                "",
            )
            .strip()
        )

        if not receipt_text:

            return Response(
                {
                    "detail":
                        "Receipt text is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            extracted = (
                extract_receipt_data(
                    receipt_text
                )
            )

            return Response(
                {
                    "success": True,
                    "data": extracted,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:

            return Response(
                {
                    "success": False,
                    "detail": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )