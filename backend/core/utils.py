"""
Shared utility functions for the application
"""
from apps.organizations.models import OrganizationMember


def is_organization_admin(user, organization):
    """
    Check if user is an admin of the organization.
    
    Args:
        user: User instance
        organization: Organization instance
        
    Returns:
        bool: True if user is admin, False otherwise
    """
    return OrganizationMember.objects.filter(
        organization=organization,
        user=user,
        role='ADMIN'
    ).exists()


def is_organization_editor_or_admin(user, organization):
    """
    Check if user is an editor or admin of the organization.
    
    Args:
        user: User instance
        organization: Organization instance
        
    Returns:
        bool: True if user is editor or admin, False otherwise
    """
    return OrganizationMember.objects.filter(
        organization=organization,
        user=user,
        role__in=['ADMIN', 'EDITOR']
    ).exists()


def get_user_organization_role(user, organization):
    """
    Get user's role in the organization.
    
    Args:
        user: User instance
        organization: Organization instance
        
    Returns:
        str or None: User's role ('ADMIN', 'EDITOR', 'VIEWER') or None if not a member
    """
    member = OrganizationMember.objects.filter(
        organization=organization,
        user=user
    ).first()
    return member.role if member else None

