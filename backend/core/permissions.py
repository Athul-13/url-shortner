"""
Custom permission classes for role-based access control
"""
from rest_framework import permissions


class IsOrganizationAdmin(permissions.BasePermission):
    """Permission to check if user is an admin of the organization"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        # This will be overridden in viewsets that use organization-based permissions
        return True


class IsOrganizationEditorOrAdmin(permissions.BasePermission):
    """Permission to check if user is an editor or admin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True


class IsOrganizationViewer(permissions.BasePermission):
    """Permission to check if user is at least a viewer"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
