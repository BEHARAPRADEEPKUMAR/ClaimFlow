import re
from datetime import datetime


def extract_receipt_data(text):
    """
    Basic receipt extraction service.

    This provides a reliable fallback when an external
    LLM API is not configured.
    """

    text_lower = text.lower()

    # -------------------------
    # Merchant
    # -------------------------
    merchant = "Unknown Merchant"

    merchants = {
        "uber": "Uber",
        "rapido": "Rapido",
        "swiggy": "Swiggy",
        "zomato": "Zomato",
        "amazon": "Amazon",
        "barista": "Barista",
        "oyo": "OYO",
        "irctc": "IRCTC",
        "decathlon": "Decathlon",
        "makemytrip": "MakeMyTrip",
        "metro": "Hyderabad Metro",
    }

    for keyword, name in merchants.items():
        if keyword in text_lower:
            merchant = name
            break

    # -------------------------
    # Amount
    # -------------------------
    amount = None

    amount_patterns = [
        r"(?:total|amount|grand total|paid|fare|price)\s*[:\-]?\s*[₹rs.]?\s*([\d,]+(?:\.\d{1,2})?)",
        r"₹\s*([\d,]+(?:\.\d{1,2})?)",
        r"rs\.?\s*([\d,]+(?:\.\d{1,2})?)",
    ]

    for pattern in amount_patterns:
        match = re.search(pattern, text_lower)

        if match:
            amount = float(
                match.group(1).replace(",", "")
            )
            break

    # -------------------------
    # Date
    # -------------------------
    expense_date = None

    date_patterns = [
        r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        r"(\d{1,2}[-/]\d{1,2}[-/]\d{4})",
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text)

        if match:
            raw_date = match.group(1)

            try:
                if len(raw_date.split("-")[0]) == 4:
                    expense_date = datetime.strptime(
                        raw_date.replace("/", "-"),
                        "%Y-%m-%d"
                    ).date().isoformat()
                else:
                    expense_date = datetime.strptime(
                        raw_date.replace("/", "-"),
                        "%d-%m-%Y"
                    ).date().isoformat()

                break

            except ValueError:
                pass

    # -------------------------
    # Category
    # -------------------------
    category = "OTHER"

    if any(word in text_lower for word in [
        "uber",
        "rapido",
        "taxi",
        "cab",
        "auto",
        "metro",
    ]):
        category = "TAXI"

    elif any(word in text_lower for word in [
        "restaurant",
        "lunch",
        "dinner",
        "breakfast",
        "food",
        "swiggy",
        "zomato",
        "barista",
    ]):
        category = "MEALS"

    elif any(word in text_lower for word in [
        "hotel",
        "oyo",
        "room",
        "stay",
    ]):
        category = "ACCOMMODATION"

    elif any(word in text_lower for word in [
        "amazon",
        "stationery",
        "office",
        "supplies",
    ]):
        category = "SUPPLIES"

    elif any(word in text_lower for word in [
        "train",
        "flight",
        "irctc",
        "airlines",
    ]):
        category = "TRAVEL"

    # -------------------------
    # Description
    # -------------------------
    description = text.strip()[:255]

    confidence = 0.70

    if merchant != "Unknown Merchant":
        confidence += 0.10

    if amount is not None:
        confidence += 0.10

    if expense_date is not None:
        confidence += 0.10

    return {
        "merchant": merchant,
        "amount": amount,
        "expense_date": expense_date,
        "category": category,
        "description": description,
        "confidence": round(confidence, 2),
    }