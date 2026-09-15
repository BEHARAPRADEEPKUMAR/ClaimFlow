from rest_framework.routers import DefaultRouter

from .views import ExpenseClaimViewSet


router = DefaultRouter()

router.register(
    r"claims",
    ExpenseClaimViewSet,
    basename="claim",
)

urlpatterns = router.urls