from rest_framework import serializers

from .models import Payment


class PaymentSerializer(
    serializers.ModelSerializer
):

    employee_name = serializers.SerializerMethodField()
    claim_number = serializers.CharField(
        source="claim.claim_number",
        read_only=True,
    )

    class Meta:

        model = Payment

        fields = [
            "id",
            "claim",
            "claim_number",
            "employee_name",
            "payment_reference",
            "amount",
            "payment_date",
            "status",
            "processed_by",
            "created_at",
        ]

        read_only_fields = fields

    def get_employee_name(self, obj):

        return (
            obj.claim.employee.get_full_name()
            or obj.claim.employee.username
        )