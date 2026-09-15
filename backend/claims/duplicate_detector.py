import re
from difflib import SequenceMatcher

from .models import ExpenseClaim


def normalize_text(value):
    if not value:
        return ""

    value = str(value).lower()

    # Normalize common receipt variations
    replacements = {
        "rs.": "rupees",
        "rs": "rupees",
        "inr": "rupees",
        "₹": "rupees",
    }

    for old, new in replacements.items():
        value = value.replace(old, new)

    # Remove punctuation
    value = re.sub(
        r"[^a-z0-9\s]",
        " ",
        value,
    )

    # Normalize spaces
    value = " ".join(
        value.split()
    )

    return value


def similarity(text1, text2):

    text1 = normalize_text(text1)
    text2 = normalize_text(text2)

    if not text1 or not text2:
        return 0.0

    return SequenceMatcher(
        None,
        text1,
        text2,
    ).ratio()


def merchant_similarity(
    merchant1,
    merchant2,
):
    return similarity(
        merchant1,
        merchant2,
    )


def receipt_similarity(
    receipt1,
    receipt2,
):
    return similarity(
        receipt1,
        receipt2,
    )


def find_possible_duplicate(claim):

    previous_claims = (
        ExpenseClaim.objects
        .filter(
            employee=claim.employee
        )
        .exclude(
            id=claim.id
        )
        .exclude(
            status=ExpenseClaim.Status.REJECTED
        )
    )

    best_match = None
    best_score = 0

    for previous in previous_claims:

        score = 0

        # --------------------------------
        # AMOUNT
        # --------------------------------

        if claim.amount == previous.amount:
            score += 35

        # --------------------------------
        # MERCHANT
        # --------------------------------

        merchant_score = merchant_similarity(
            claim.merchant,
            previous.merchant,
        )

        if merchant_score >= 0.90:
            score += 25

        elif merchant_score >= 0.75:
            score += 18

        elif merchant_score >= 0.60:
            score += 10

        # --------------------------------
        # RECEIPT TEXT
        # --------------------------------

        receipt_score = receipt_similarity(
            claim.receipt_text,
            previous.receipt_text,
        )

        if receipt_score >= 0.90:
            score += 25

        elif receipt_score >= 0.75:
            score += 18

        elif receipt_score >= 0.60:
            score += 10

        # --------------------------------
        # DESCRIPTION
        # --------------------------------

        description_score = similarity(
            claim.description,
            previous.description,
        )

        if description_score >= 0.90:
            score += 15

        elif description_score >= 0.75:
            score += 10

        elif description_score >= 0.60:
            score += 5

        # --------------------------------
        # DATE
        # --------------------------------
        #
        # Date is intentionally NOT required.
        #
        # A duplicate can appear:
        # same day
        # 3 days later
        # 3 weeks later
        #
        # Therefore we do not reject duplicate
        # detection just because dates differ.
        #
        if claim.expense_date == previous.expense_date:
            score += 5

        # --------------------------------
        # FINAL MATCH
        # --------------------------------

        if score > best_score:
            best_score = score
            best_match = previous

    if best_match and best_score >= 65:

        return {
            "is_duplicate": True,
            "score": round(
                best_score,
                2,
            ),
            "duplicate_of": best_match,
        }

    return None