"""
Utility functions for organization invitations
"""
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from .models import OrganizationInvitation, OrganizationMember


def generate_invitation_token():
    """Generate a unique secure token for invitations"""
    import secrets
    return secrets.token_urlsafe(32)


def accept_invitation(user, token):
    """
    Validate and accept an organization invitation.
    
    Args:
        user: User instance accepting the invitation
        token: Invitation token
        
    Returns:
        OrganizationInvitation: The accepted invitation
        
    Raises:
        ValidationError: If invitation is invalid, expired, or email doesn't match
    """
    try:
        invitation = OrganizationInvitation.objects.get(
            token=token,
            status='PENDING'
        )
    except OrganizationInvitation.DoesNotExist:
        raise DRFValidationError({'invite_token': 'Invalid or expired invitation token.'})
    
    # Check if invitation has expired
    if invitation.is_expired():
        invitation.mark_as_expired()
        raise DRFValidationError({'invite_token': 'This invitation has expired.'})
    
    # Check if email matches
    if invitation.email.lower() != user.email.lower():
        raise DRFValidationError({
            'invite_token': f'This invitation was sent to {invitation.email}, but you signed up with {user.email}.'
        })
    
    # Check if user is already a member
    if OrganizationMember.objects.filter(
        organization=invitation.organization,
        user=user
    ).exists():
        raise DRFValidationError({
            'invite_token': 'You are already a member of this organization.'
        })
    
    # Create membership
    OrganizationMember.objects.create(
        organization=invitation.organization,
        user=user,
        role=invitation.role
    )
    
    # Mark invitation as accepted
    invitation.status = 'ACCEPTED'
    invitation.accepted_at = timezone.now()
    invitation.save(update_fields=['status', 'accepted_at'])
    
    return invitation

