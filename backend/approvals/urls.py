from django.urls import path

from .views import (
    ApprovalListView,
    StartReviewView,
    ApproveClaimView,
    RejectClaimView,
)


urlpatterns = [

    path(
        "",
        ApprovalListView.as_view(),
        name="approval-list",
    ),

    path(
        "<int:pk>/review/",
        StartReviewView.as_view(),
        name="start-review",
    ),

    path(
        "<int:pk>/approve/",
        ApproveClaimView.as_view(),
        name="approve-claim",
    ),

    path(
        "<int:pk>/reject/",
        RejectClaimView.as_view(),
        name="reject-claim",
    ),
]