from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "department",
            "monthly_limit",
            "manager",
            "avatar",
        ]

        read_only_fields = [
            "id",
            "full_name",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name().strip() or obj.username
    
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ClaimFlowTokenSerializer(
    TokenObtainPairSerializer
):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["role"] = user.role
        token["username"] = user.username
        token["email"] = user.email

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data["user"] = UserSerializer(
            self.user
        ).data

        return data
    
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        try:
            user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.get_full_name(),
                "role": user.role,
                "department": user.department,
                "monthly_limit": str(
                    user.monthly_limit
                ),
            },
        }