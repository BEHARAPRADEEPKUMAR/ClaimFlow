from django.contrib.auth.models import AbstractUser
from django.db import models
    

class User(AbstractUser):

    class Role(models.TextChoices):
        EMPLOYEE = "EMPLOYEE", "Employee"
        MANAGER = "MANAGER", "Manager"
        FINANCE = "FINANCE", "Finance"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE,
    )

    department = models.CharField(
        max_length=100,
        blank=True,
    )

    monthly_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=30000,
    )

    manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="team_members",
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        full_name = self.get_full_name().strip()

        if full_name:
            return f"{full_name} ({self.role})"

        return f"{self.username} ({self.role})"