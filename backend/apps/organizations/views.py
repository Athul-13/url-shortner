from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, NotFound
from django.utils import timezone
from datetime import timedelta
from .models import Organization, OrganizationMember, OrganizationInvitation
from .serializers import (
    OrganizationSerializer, OrganizationCreateSerializer,
    InviteUserSerializer, OrganizationInvitationSerializer,
    AcceptInvitationSerializer, UpdateMemberRoleSerializer
)
from .email import send_invitation_email
from .utils import accept_invitation
from core.permissions import IsOrganizationAdmin
from core.utils import is_organization_admin


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for organizations"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        """
        Optimized queryset using prefetch_related to avoid N+1 queries.
        Only return organizations where user is a member.
        """
        return Organization.objects.filter(
            members__user=self.request.user
        ).prefetch_related('members__user').distinct()
    
    def list(self, request):
        """List all organizations where user is a member"""
        queryset = self.get_queryset()
        
        # Let DRF handle pagination automatically
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get organization details"""
        # Use DRF's get_object which handles 404 automatically
        organization = self.get_object()
        serializer = self.get_serializer(organization)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new organization"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            organization = serializer.save()
            response_serializer = OrganizationSerializer(organization, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsOrganizationAdmin])
    def invite(self, request, pk=None):
        """Invite a user to the organization"""
        organization = self.get_object()
        
        # Check if user is admin
        if not is_organization_admin(request.user, organization):
            raise PermissionDenied("Only organization admins can invite members.")
        
        serializer = InviteUserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            
            # Check if user is already a member
            existing_member = OrganizationMember.objects.filter(
                organization=organization,
                user__email__iexact=email
            ).first()
            
            if existing_member:
                return Response(
                    {'email': 'This user is already a member of the organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if there's a pending invitation for this email
            pending_invitation = OrganizationInvitation.objects.filter(
                organization=organization,
                email__iexact=email,
                status='PENDING'
            ).first()
            
            if pending_invitation and not pending_invitation.is_expired():
                return Response(
                    {'email': 'A pending invitation already exists for this email.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create invitation
            invitation = OrganizationInvitation.objects.create(
                email=email,
                organization=organization,
                role=role,
                invited_by=request.user,
                expires_at=timezone.now() + timedelta(days=7)
            )
            
            # Send invitation email
            try:
                send_invitation_email(invitation)
            except Exception as e:
                # Log error but don't fail the invitation creation
                print(f"Failed to send invitation email: {e}")
            
            response_serializer = OrganizationInvitationSerializer(invitation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)')
    def update_member_role(self, request, pk=None, member_id=None):
        """Update a member's role (admin only)"""
        organization = self.get_object()
        
        # Check if user is admin
        if not is_organization_admin(request.user, organization):
            raise PermissionDenied("Only organization admins can update member roles.")
        
        try:
            member = OrganizationMember.objects.get(
                id=member_id,
                organization=organization
            )
        except OrganizationMember.DoesNotExist:
            raise NotFound("Member not found in this organization.")
        
        # Prevent admin from changing their own role if they're the only admin
        if member.user == request.user and member.role == 'ADMIN':
            admin_count = OrganizationMember.objects.filter(
                organization=organization,
                role='ADMIN'
            ).count()
            if admin_count == 1:
                return Response(
                    {'role': 'Cannot change your own role. You are the only admin.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = UpdateMemberRoleSerializer(data=request.data)
        if serializer.is_valid():
            new_role = serializer.validated_data['role']
            
            # Validate promotion rules
            current_role = member.role
            if current_role == 'ADMIN' and new_role != 'ADMIN':
                # Admin can demote themselves or others
                pass
            elif current_role == 'EDITOR' and new_role not in ['ADMIN', 'EDITOR']:
                # Editor can only be promoted to admin
                return Response(
                    {'role': 'Editor can only be promoted to Admin.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif current_role == 'VIEWER' and new_role == 'VIEWER':
                # No change
                pass
            
            member.role = new_role
            member.save(update_fields=['role'])
            
            from .serializers import OrganizationMemberSerializer
            response_serializer = OrganizationMemberSerializer(member)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvitationViewSet(viewsets.ViewSet):
    """ViewSet for invitation operations"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)/validate', permission_classes=[])
    def validate(self, request, token=None):
        """Validate an invitation token (public endpoint)"""
        try:
            invitation = OrganizationInvitation.objects.get(token=token)
        except OrganizationInvitation.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid invitation token.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if invitation.status != 'PENDING':
            return Response(
                {'valid': False, 'error': f'Invitation is {invitation.status.lower()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invitation.is_expired():
            invitation.mark_as_expired()
            return Response(
                {'valid': False, 'error': 'Invitation has expired.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'valid': True,
            'email': invitation.email,
            'organization_name': invitation.organization.name,
            'role': invitation.role,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='(?P<token>[^/.]+)/accept')
    def accept(self, request, token=None):
        """Accept an invitation (requires authentication)"""
        try:
            invitation = accept_invitation(request.user, token)
            return Response({
                'success': True,
                'organization_id': invitation.organization.id,
                'organization_name': invitation.organization.name,
                'role': invitation.role,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            if hasattr(e, 'detail'):
                return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
