from rest_framework import serializers
from .models import ExpenseClaim


class ExpenseClaimSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )
    duplicate_claim_number = serializers.SerializerMethodField()
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseClaim

        fields = [
            "id",
            "claim_number",

            "employee",
            "employee_name",

            "category",
            "category_display",

            "merchant",
            "amount",
            "expense_date",
            "description",

            "receipt_text",
            "receipt_image",
            "receipt_url",

            "status",
            "status_display",

            "ai_extracted",
            "ai_confidence",

            "duplicate_flag",
            "duplicate_of",
            "duplicate_claim_number",

            "submitted_at",
            "approved_at",
            "paid_at",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "claim_number",

            "employee",
            "employee_name",

            "category_display",

            "status",
            "status_display",

            "ai_extracted",
            "ai_confidence",

            "duplicate_flag",
            "duplicate_of",
            "duplicate_claim_number",

            "receipt_url",

            "submitted_at",
            "approved_at",
            "paid_at",

            "created_at",
            "updated_at",
        ]

    def get_employee_name(self, obj):
        return obj.employee.get_full_name()

    def get_duplicate_claim_number(self, obj):
        if not obj.duplicate_of:
            return None

        return obj.duplicate_of.claim_number

    def get_receipt_url(self, obj):
        """
        Return the complete URL for the uploaded bill.
        """

        if not obj.receipt_image:
            return None

        request = self.context.get("request")

        try:
            url = obj.receipt_image.url

            if request:
                return request.build_absolute_uri(url)

            return url

        except Exception:
            return None

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value

    def validate_description(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Description is required."
            )

        return value

    def validate_receipt_image(self, value):

        if not value:
            raise serializers.ValidationError(
                "Bill / receipt upload is mandatory."
            )

        allowed_types = [
            "image/jpeg",
            "image/png",
            "application/pdf",
        ]

        content_type = getattr(value, "content_type", "")

        if content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only JPG, JPEG, PNG and PDF files are allowed."
            )

        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Bill must be smaller than 5 MB."
            )

        return value

    def validate(self, attrs):

        if not attrs.get("receipt_image"):
            raise serializers.ValidationError({
                "receipt_image":
                    "Bill / receipt is mandatory before submitting a claim."
            })

        return attrs