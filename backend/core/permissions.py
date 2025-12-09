"""
Custom permission classes for role-based access control
"""
from rest_framework import permissions
from core.utils import is_organization_admin, is_organization_editor_or_admin


class IsOrganizationAdmin(permissions.BasePermission):
    """Permission to check if user is an admin of the organization"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user is admin of the organization.
        Works with objects that have an 'organization' attribute,
        or objects with 'namespace.organization' (like ShortURL).
        """
        # Direct organization attribute (e.g., Namespace)
        if hasattr(obj, 'organization'):
            return is_organization_admin(request.user, obj.organization)
        # Nested through namespace (e.g., ShortURL)
        elif hasattr(obj, 'namespace') and hasattr(obj.namespace, 'organization'):
            return is_organization_admin(request.user, obj.namespace.organization)
        return False


class IsOrganizationEditorOrAdmin(permissions.BasePermission):
    """Permission to check if user is an editor or admin of the organization"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user is editor or admin of the organization.
        Works with objects that have an 'organization' attribute,
        or objects with 'namespace.organization' (like ShortURL).
        """
        # Direct organization attribute (e.g., Namespace)
        if hasattr(obj, 'organization'):
            return is_organization_editor_or_admin(request.user, obj.organization)
        # Nested through namespace (e.g., ShortURL)
        elif hasattr(obj, 'namespace') and hasattr(obj.namespace, 'organization'):
            return is_organization_editor_or_admin(request.user, obj.namespace.organization)
        return False


class IsOrganizationViewer(permissions.BasePermission):
    """Permission to check if user is at least a viewer (any member)"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user is a member (viewer, editor, or admin) of the organization.
        Works with objects that have an 'organization' attribute.
        """
        if hasattr(obj, 'organization'):
            from apps.organizations.models import OrganizationMember
            return OrganizationMember.objects.filter(
                organization=obj.organization,
                user=request.user
            ).exists()
        return False
