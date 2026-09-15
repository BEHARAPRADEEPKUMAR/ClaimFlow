from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import EmailLoginSerializer, UserSerializer
from rest_framework_simplejwt.views import (
    TokenObtainPairView
)

from .serializers import (
    UserSerializer,
    ClaimFlowTokenSerializer,
    EmailLoginSerializer,
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailLoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )

class CurrentUserView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data
        )