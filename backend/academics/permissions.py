from rest_framework import permissions


class IsTeacherUser(permissions.BasePermission):
    """Allows access only to users with role TEACHER."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'TEACHER'
        )


class IsStudentUser(permissions.BasePermission):
    """Allows access only to users with role STUDENT."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )