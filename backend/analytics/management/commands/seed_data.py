from datetime import date, timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from claims.models import ExpenseClaim
from approvals.models import Approval
from payments.models import Payment
from analytics.models import MonthlyBudget, AuditLog


class Command(BaseCommand):

    help = "Create realistic ClaimFlow demo data"

    @transaction.atomic
    def handle(self, *args, **options):

        self.stdout.write(
            self.style.WARNING(
                "Creating ClaimFlow demo data..."
            )
        )

        # --------------------------------------------------
        # CLEAR OLD DEMO DATA
        # --------------------------------------------------

        Payment.objects.all().delete()
        Approval.objects.all().delete()
        AuditLog.objects.all().delete()
        ExpenseClaim.objects.all().delete()
        MonthlyBudget.objects.all().delete()

        # Keep superusers, remove normal users
        User.objects.filter(is_superuser=False).delete()

        # --------------------------------------------------
        # MANAGERS
        # --------------------------------------------------

        managers_data = [
            {
                "username": "arjun.mehta",
                "first_name": "Arjun",
                "last_name": "Mehta",
                "email": "arjun.mehta@claimflow.demo",
                "department": "Engineering",
                "limit": 50000,
            },
            {
                "username": "kavya.reddy",
                "first_name": "Kavya",
                "last_name": "Reddy",
                "email": "kavya.reddy@claimflow.demo",
                "department": "Sales",
                "limit": 45000,
            },
            {
                "username": "rohit.sharma",
                "first_name": "Rohit",
                "last_name": "Sharma",
                "email": "rohit.sharma@claimflow.demo",
                "department": "Operations",
                "limit": 40000,
            },
        ]

        managers = []

        for data in managers_data:

            manager = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password="Demo@123",
                first_name=data["first_name"],
                last_name=data["last_name"],
                role=User.Role.MANAGER,
                department=data["department"],
                monthly_limit=Decimal(data["limit"]),
            )

            managers.append(manager)

        # --------------------------------------------------
        # FINANCE USERS
        # --------------------------------------------------

        finance_data = [
            {
                "username": "priya.finance",
                "first_name": "Priya",
                "last_name": "Sharma",
                "email": "priya.finance@claimflow.demo",
            },
            {
                "username": "vikram.finance",
                "first_name": "Vikram",
                "last_name": "Singh",
                "email": "vikram.finance@claimflow.demo",
            },
        ]

        finance_users = []

        for data in finance_data:

            finance = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password="Demo@123",
                first_name=data["first_name"],
                last_name=data["last_name"],
                role=User.Role.FINANCE,
                department="Finance",
                monthly_limit=Decimal("50000"),
            )

            finance_users.append(finance)

        # --------------------------------------------------
        # EMPLOYEES
        # --------------------------------------------------

        employees_data = [
            (
                "rahul.reddy",
                "Rahul",
                "Reddy",
                "rahul.reddy@claimflow.demo",
                "Engineering",
                30000,
                0,
            ),
            (
                "sneha.iyer",
                "Sneha",
                "Iyer",
                "sneha.iyer@claimflow.demo",
                "Marketing",
                25000,
                1,
            ),
            (
                "karthik.rao",
                "Karthik",
                "Rao",
                "karthik.rao@claimflow.demo",
                "Sales",
                30000,
                1,
            ),
            (
                "ananya.nair",
                "Ananya",
                "Nair",
                "ananya.nair@claimflow.demo",
                "Engineering",
                35000,
                0,
            ),
            (
                "meera.kapoor",
                "Meera",
                "Kapoor",
                "meera.kapoor@claimflow.demo",
                "HR",
                25000,
                2,
            ),
            (
                "aditya.verma",
                "Aditya",
                "Verma",
                "aditya.verma@claimflow.demo",
                "Operations",
                28000,
                2,
            ),
            (
                "neha.patel",
                "Neha",
                "Patel",
                "neha.patel@claimflow.demo",
                "Marketing",
                30000,
                1,
            ),
            (
                "sanjay.kumar",
                "Sanjay",
                "Kumar",
                "sanjay.kumar@claimflow.demo",
                "Sales",
                30000,
                1,
            ),
        ]

        employees = []

        for (
            username,
            first_name,
            last_name,
            email,
            department,
            monthly_limit,
            manager_index,
        ) in employees_data:

            employee = User.objects.create_user(
                username=username,
                email=email,
                password="Demo@123",
                first_name=first_name,
                last_name=last_name,
                role=User.Role.EMPLOYEE,
                department=department,
                monthly_limit=Decimal(monthly_limit),
                manager=managers[manager_index],
            )

            employees.append(employee)

        # --------------------------------------------------
        # MAKE MANAGERS ALSO HAVE THEIR OWN CLAIMS
        # --------------------------------------------------

        claim_users = employees + managers

        # --------------------------------------------------
        # REALISTIC RECEIPT DATA
        # --------------------------------------------------

        receipts = [
            {
                "merchant": "Uber",
                "category": ExpenseClaim.Category.TAXI,
                "amount": 420,
                "description": "Airport to HITEC City",
                "receipt_text": (
                    "UBER INDIA\n"
                    "trip 8F29K\n"
                    "HYD AIRPORT > HITECH CITY\n"
                    "07/09/2026\n"
                    "fare 420.00"
                ),
            },
            {
                "merchant": "Hyderabad Metro Rail",
                "category": ExpenseClaim.Category.TRAVEL,
                "amount": 250,
                "description": "Ameerpet to HITEC City metro travel",
                "receipt_text": (
                    "metro 250\n"
                    "5 sep\n"
                    "ameerpet hitech"
                ),
            },
            {
                "merchant": "Barista Coffee",
                "category": ExpenseClaim.Category.MEALS,
                "amount": 680,
                "description": "Client meeting refreshments",
                "receipt_text": (
                    "BARISTA COFFEE\n"
                    "Madhapur\n"
                    "08 Sept 2026\n"
                    "2 Cappuccino\n"
                    "1 Sandwich\n"
                    "Total Rs 680"
                ),
            },
            {
                "merchant": "Amazon Business",
                "category": ExpenseClaim.Category.SUPPLIES,
                "amount": 1240,
                "description": "Office stationery and notebooks",
                "receipt_text": (
                    "AMAZON BUSINESS\n"
                    "Order #408-77821\n"
                    "Notebook x5\n"
                    "Pens x2\n"
                    "Total INR 1240"
                ),
            },
            {
                "merchant": "IRCTC",
                "category": ExpenseClaim.Category.TRAVEL,
                "amount": 1850,
                "description": "Train ticket for client visit",
                "receipt_text": (
                    "IRCTC\n"
                    "HYDERABAD TO BANGALORE\n"
                    "06-09-26\n"
                    "TOTAL 1850"
                ),
            },
            {
                "merchant": "OYO",
                "category": ExpenseClaim.Category.ACCOMMODATION,
                "amount": 3250,
                "description": "One night accommodation during business trip",
                "receipt_text": (
                    "OYO ROOMS\n"
                    "Booking 920183\n"
                    "Bangalore\n"
                    "1 Night\n"
                    "Amount 3250"
                ),
            },
            {
                "merchant": "Swiggy",
                "category": ExpenseClaim.Category.MEALS,
                "amount": 540,
                "description": "Team dinner during late deployment",
                "receipt_text": (
                    "SWIGGY\n"
                    "Team dinner\n"
                    "05/09/2026\n"
                    "Total: Rs.540"
                ),
            },
            {
                "merchant": "Decathlon",
                "category": ExpenseClaim.Category.SUPPLIES,
                "amount": 2100,
                "description": "Safety equipment for company event",
                "receipt_text": (
                    "DECATHLON\n"
                    "Safety supplies\n"
                    "Amount INR 2100"
                ),
            },
            {
                "merchant": "Rapido",
                "category": ExpenseClaim.Category.TAXI,
                "amount": 185,
                "description": "Bike ride from office to client location",
                "receipt_text": (
                    "RAPIDO\n"
                    "Bike ride\n"
                    "Madhapur - Kondapur\n"
                    "Rs 185"
                ),
            },
            {
                "merchant": "MakeMyTrip",
                "category": ExpenseClaim.Category.TRAVEL,
                "amount": 4600,
                "description": "Flight booking for business travel",
                "receipt_text": (
                    "MAKEMYTRIP\n"
                    "HYD - DEL\n"
                    "Business travel\n"
                    "Total INR 4600"
                ),
            },
        ]

        statuses = [
            ExpenseClaim.Status.PAID,
            ExpenseClaim.Status.PAID,
            ExpenseClaim.Status.PAID,
            ExpenseClaim.Status.PAID,
            ExpenseClaim.Status.APPROVED,
            ExpenseClaim.Status.APPROVED,
            ExpenseClaim.Status.UNDER_REVIEW,
            ExpenseClaim.Status.SUBMITTED,
            ExpenseClaim.Status.REJECTED,
        ]

        today = date.today()

        claims = []

        # --------------------------------------------------
        # CREATE NORMAL CLAIMS
        # --------------------------------------------------

        for index in range(35):

            user = claim_users[index % len(claim_users)]
            receipt = receipts[index % len(receipts)]

            status = statuses[index % len(statuses)]

            expense_date = (
                today - timedelta(
                    days=random.randint(1, 28)
                )
            )

            claim = ExpenseClaim.objects.create(
                employee=user,
                category=receipt["category"],
                merchant=receipt["merchant"],
                amount=Decimal(
                    str(receipt["amount"])
                ),
                expense_date=expense_date,
                description=receipt["description"],
                receipt_text=receipt["receipt_text"],

                # Start as DRAFT so the immutable PAID rule
                # does not interfere with seed-data creation.
                status=ExpenseClaim.Status.DRAFT,

                ai_extracted=random.choice(
                    [True, True, False]
                ),

                ai_confidence=Decimal(
                    str(
                        random.randint(
                            82,
                            98
                        )
                    )
                ),
            )

            # -----------------------------------------------
            # Set lifecycle timestamps
            # -----------------------------------------------

            if status != ExpenseClaim.Status.DRAFT:

                claim.submitted_at = claim.created_at


            if status in [
                ExpenseClaim.Status.APPROVED,
                ExpenseClaim.Status.PAID,
            ]:

                claim.approved_at = claim.created_at


            if status == ExpenseClaim.Status.PAID:

                claim.paid_at = claim.created_at


            # -----------------------------------------------
            # Finally set the real status
            # -----------------------------------------------

            claim.status = status

            claim.save()

        # --------------------------------------------------
        # DUPLICATE CLAIMS
        # --------------------------------------------------

            original = ExpenseClaim.objects.create(
                employee=employees[0],
                category=ExpenseClaim.Category.TAXI,
                merchant="Uber",
                amount=Decimal("420.00"),
                expense_date=date(2026, 9, 7),
                description="Airport to HITEC City",
                receipt_text=(
                    "UBER INDIA\n"
                    "HYD AIRPORT TO HITECH CITY\n"
                    "07/09/2026\n"
                    "TOTAL 420"
                ),
                status=ExpenseClaim.Status.DRAFT,
            )

            original.submitted_at = original.created_at
            original.approved_at = original.created_at
            original.paid_at = original.created_at

            original.status = ExpenseClaim.Status.PAID

            original.save()
            
        duplicate = ExpenseClaim.objects.create(
            employee=employees[0],
            category=ExpenseClaim.Category.TAXI,
            merchant="Uber Technologies",
            amount=Decimal("420.00"),
            expense_date=date(2026, 9, 7),
            description="Uber ride Airport → Hitech City",
            receipt_text=(
                "uber technologies\n"
                "airport - hitech\n"
                "7 sept\n"
                "fare Rs 420"
            ),
            status=ExpenseClaim.Status.SUBMITTED,
            duplicate_flag=True,
            duplicate_of=original,
        )

        # --------------------------------------------------
        # SECOND DUPLICATE EXAMPLE
        # --------------------------------------------------

        original_2 = ExpenseClaim.objects.create(
            employee=employees[1],
            category=ExpenseClaim.Category.TRAVEL,
            merchant="Hyderabad Metro Rail",
            amount=Decimal("250.00"),
            expense_date=date(2026, 9, 5),
            description="Ameerpet to HITEC City",
            receipt_text=(
                "Hyderabad Metro Rail\n"
                "Ameerpet - Hitech City\n"
                "05/09/2026\n"
                "Rs 250"
            ),
            status=ExpenseClaim.Status.APPROVED,
        )

        duplicate_2 = ExpenseClaim.objects.create(
            employee=employees[1],
            category=ExpenseClaim.Category.TRAVEL,
            merchant="Metro Hitech/Ameerpet",
            amount=Decimal("250.00"),
            expense_date=date(2026, 9, 5),
            description="Metro ride from Ameerpet to Hitech",
            receipt_text=(
                "metro 250\n"
                "5-9-2026\n"
                "ameerpet hitech"
            ),
            status=ExpenseClaim.Status.SUBMITTED,
            duplicate_flag=True,
            duplicate_of=original_2,
        )

        # --------------------------------------------------
        # APPROVALS
        # --------------------------------------------------

        for claim in claims:

            if claim.status in [
                ExpenseClaim.Status.APPROVED,
                ExpenseClaim.Status.PAID,
            ]:

                manager = claim.employee.manager

                if manager:

                    Approval.objects.create(
                        claim=claim,
                        manager=manager,
                        action=Approval.Action.APPROVED,
                        comment="Expense verified and approved.",
                    )

            elif claim.status == ExpenseClaim.Status.REJECTED:

                manager = claim.employee.manager

                if manager:

                    Approval.objects.create(
                        claim=claim,
                        manager=manager,
                        action=Approval.Action.REJECTED,
                        comment=(
                            "Receipt information "
                            "requires clarification."
                        ),
                    )

        # --------------------------------------------------
        # PAYMENTS
        # --------------------------------------------------

        paid_claims = ExpenseClaim.objects.filter(
            status=ExpenseClaim.Status.PAID
        )

        for index, claim in enumerate(paid_claims):

            finance_user = finance_users[
                index % len(finance_users)
            ]

            Payment.objects.create(
                claim=claim,
                payment_reference=(
                    f"PAY-{random.randint(100000, 999999)}"
                ),
                amount=claim.amount,
                payment_date=claim.paid_at,
                status=Payment.Status.PAID,
                processed_by=finance_user,
            )

        # --------------------------------------------------
        # MONTHLY BUDGETS
        # --------------------------------------------------

        current_month = today.replace(day=1)

        for employee in claim_users:

            limit = Decimal(
                employee.monthly_limit
            )

            spent = Decimal("0")

            employee_claims = ExpenseClaim.objects.filter(
                employee=employee,
                status=ExpenseClaim.Status.PAID,
                expense_date__year=current_month.year,
                expense_date__month=current_month.month,
            )

            for claim in employee_claims:
                spent += claim.amount

            MonthlyBudget.objects.create(
                employee=employee,
                month=current_month,
                limit=limit,
                spent=spent,
            )

        # --------------------------------------------------
        # SPECIAL NEAR-LIMIT USER
        # --------------------------------------------------

        near_limit_user = employees[2]

        budget = MonthlyBudget.objects.get(
            employee=near_limit_user,
            month=current_month,
        )

        budget.spent = Decimal("28750.00")
        budget.save()

        # --------------------------------------------------
        # SPECIAL OVER-LIMIT USER
        # --------------------------------------------------

        over_limit_user = employees[4]

        budget = MonthlyBudget.objects.get(
            employee=over_limit_user,
            month=current_month,
        )

        budget.spent = Decimal("27450.00")
        budget.limit = Decimal("25000.00")
        budget.save()

        # --------------------------------------------------
        # AUDIT LOGS
        # --------------------------------------------------

        for claim in claims[:15]:

            AuditLog.objects.create(
                user=claim.employee,
                claim=claim,
                action="CLAIM_CREATED",
                description=(
                    f"{claim.claim_number} created "
                    f"by {claim.employee.get_full_name()}."
                ),
            )

            if claim.status != ExpenseClaim.Status.DRAFT:

                AuditLog.objects.create(
                    user=claim.employee,
                    claim=claim,
                    action="CLAIM_SUBMITTED",
                    description=(
                        f"{claim.claim_number} submitted "
                        "for approval."
                    ),
                )

        # --------------------------------------------------
        # FINAL OUTPUT
        # --------------------------------------------------

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "ClaimFlow demo data created successfully!"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )

        self.stdout.write("")

        self.stdout.write(
            f"Managers: {len(managers)}"
        )

        self.stdout.write(
            f"Employees: {len(employees)}"
        )

        self.stdout.write(
            f"Finance users: {len(finance_users)}"
        )

        self.stdout.write(
            f"Claims: {ExpenseClaim.objects.count()}"
        )

        self.stdout.write(
            f"Payments: {Payment.objects.count()}"
        )

        self.stdout.write(
            f"Budgets: {MonthlyBudget.objects.count()}"
        )

        self.stdout.write("")

        self.stdout.write(
            self.style.WARNING(
                "Demo password for all users: Demo@123"
            )
        )