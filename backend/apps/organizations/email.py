"""
Email service for organization invitations
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_invitation_email(invitation):
    """
    Send invitation email to the invited user.
    
    Args:
        invitation: OrganizationInvitation instance
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5174')
    invitation_url = f"{frontend_url}/invite/{invitation.token}"
    
    organization_name = invitation.organization.name
    inviter_name = invitation.invited_by.get_full_name() or invitation.invited_by.username
    role = invitation.get_role_display()
    
    subject = f"You've been invited to join {organization_name}"
    
    # Simple text email
    message = f"""
Hello,

{inviter_name} has invited you to join {organization_name} as a {role}.

Click the link below to accept the invitation:
{invitation_url}

This invitation will expire in 7 days.

If you don't have an account, you'll be able to create one when you click the link.

Best regards,
The {organization_name} Team
"""
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@urlshort.com')
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[invitation.email],
            fail_silently=False,
        )
    except Exception as e:
        # Log error but don't fail the invitation creation
        # In production, you might want to use proper logging
        print(f"Failed to send invitation email: {e}")

