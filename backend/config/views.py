from django.http import JsonResponse


def health_check(request):
    return JsonResponse({
        "status": "success",
        "message": "ClaimFlow API is running",
        "service": "Django REST API",
    })