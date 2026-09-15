import json
import os
import re
from datetime import datetime

import requests


KNOWN_MERCHANTS = [
    "Uber",
    "Rapido",
    "Swiggy",
    "Zomato",
    "Barista",
    "Amazon",
    "Amazon Business",
    "Decathlon",
    "IRCTC",
    "OYO",
    "MakeMyTrip",
    "Hyderabad Metro",
]


def detect_category(text):
    text = text.lower()

    if any(word in text for word in [
        "uber", "rapido", "taxi", "cab", "metro", "ride"
    ]):
        return "TAXI"

    if any(word in text for word in [
        "swiggy", "zomato", "restaurant", "cafe", "barista",
        "meal", "food", "lunch", "dinner"
    ]):
        return "MEALS"

    if any(word in text for word in [
        "oyo", "hotel", "room", "accommodation"
    ]):
        return "ACCOMMODATION"

    if any(word in text for word in [
        "amazon", "decathlon", "supplies", "stationery",
        "office"
    ]):
        return "SUPPLIES"

    if any(word in text for word in [
        "irctc", "train", "flight", "airline",
        "makemytrip", "travel"
    ]):
        return "TRAVEL"

    return "OTHER"


def detect_merchant(text):
    text_lower = text.lower()

    for merchant in KNOWN_MERCHANTS:
        if merchant.lower() in text_lower:
            return merchant

    # Try common merchant patterns
    match = re.search(
        r"(?:merchant|vendor|store|restaurant)\s*[:\-]\s*([^\n,]+)",
        text,
        re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

    return ""


def detect_amount(text):
    patterns = [
        r"(?:total|amount|grand total|paid|fare)\s*[:\-]?\s*₹?\s*([0-9,]+(?:\.[0-9]{1,2})?)",
        r"₹\s*([0-9,]+(?:\.[0-9]{1,2})?)",
        r"\b([0-9,]+\.[0-9]{2})\b",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)

        if matches:
            value = matches[-1].replace(",", "")

            try:
                return float(value)
            except ValueError:
                pass

    return None


def detect_date(text):
    patterns = [
        r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b",
        r"\b(\d{4}[/-]\d{2}[/-]\d{2})\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            value = match.group(1)

            for fmt in [
                "%d/%m/%Y",
                "%d-%m-%Y",
                "%Y/%m/%d",
                "%Y-%m-%d",
            ]:
                try:
                    return datetime.strptime(value, fmt).date().isoformat()
                except ValueError:
                    continue

    return None


def fallback_extraction(receipt_text):
    merchant = detect_merchant(receipt_text)
    amount = detect_amount(receipt_text)
    expense_date = detect_date(receipt_text)
    category = detect_category(receipt_text)

    description = receipt_text.strip()

    confidence = 0.55

    if merchant:
        confidence += 0.10

    if amount is not None:
        confidence += 0.15

    if expense_date:
        confidence += 0.10

    if category != "OTHER":
        confidence += 0.05

    confidence = min(confidence, 0.95)

    return {
        "merchant": merchant,
        "amount": amount,
        "expense_date": expense_date,
        "category": category,
        "description": description[:500],
        "confidence": round(confidence, 2),
        "source": "fallback_parser",
    }


def extract_with_openai(receipt_text):
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        return None

    prompt = f"""
Extract expense claim information from the following messy receipt text.

Return ONLY valid JSON.

Required fields:
merchant
amount
expense_date
category
description
confidence

Allowed categories:
TRAVEL, MEALS, SUPPLIES, TAXI, ACCOMMODATION, OTHER

Receipt text:
{receipt_text}
"""

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "temperature": 0,
            "response_format": {
                "type": "json_object"
            },
        },
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    content = data["choices"][0]["message"]["content"]

    extracted = json.loads(content)

    extracted["source"] = "openai"

    return extracted


def extract_receipt_data(receipt_text):
    receipt_text = receipt_text.strip()

    if not receipt_text:
        raise ValueError("Receipt text cannot be empty.")

    try:
        ai_result = extract_with_openai(receipt_text)

        if ai_result:
            return ai_result

    except Exception:
        # Fall back to local extraction if AI is unavailable.
        pass

    return fallback_extraction(receipt_text)