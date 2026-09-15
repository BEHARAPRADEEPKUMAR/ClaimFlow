from rest_framework import serializers

from .models import Approval


class ApprovalSerializer(
    serializers.ModelSerializer
):

    manager_name = serializers.SerializerMethodField()

    class Meta:

        model = Approval

        fields = [
            "id",
            "claim",
            "manager",
            "manager_name",
            "action",
            "comment",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "manager",
            "manager_name",
            "created_at",
        ]

    def get_manager_name(self, obj):

        return (
            obj.manager.get_full_name()
            or obj.manager.username
        )