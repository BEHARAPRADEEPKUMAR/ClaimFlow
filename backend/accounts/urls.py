from django.urls import path
from django.urls import path
from .views import LoginView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView


from .views import (
    LoginView,
    CurrentUserView,
)


urlpatterns = [

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),

]