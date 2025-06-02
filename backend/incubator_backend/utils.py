# utils.py
from rest_framework.response import Response
from rest_framework import status

def is_admin(user):
    # Check if user is authenticated and has a role attribute
    if not hasattr(user, 'is_authenticated') or not user.is_authenticated:
        return False
    if not hasattr(user, 'role') or user.role is None:
        return False
    return user.role.name.lower() == 'admin'

def is_student(user):
    # Check if user is authenticated and has a role attribute
    if not hasattr(user, 'is_authenticated') or not user.is_authenticated:
        return False
    if not hasattr(user, 'role') or user.role is None:
        return False
    return user.role.name.lower() == 'student'

def is_owner(user, obj):
    return obj.user == user

def error_response(message, code, status_code):
    return Response({'error': message, 'code': code}, status=status_code)

def get_user_status(user):
    """
    Get the status of a user based on is_active field.
    Returns: 'available' or 'unavailable'
    """
    if user.is_active:
        return 'available'
    else:
        return 'unavailable'

def is_user_available(user):
    """
    Check if a user is available (active)
    """
    return user.is_active
