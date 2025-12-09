from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization, OrganizationMember, OrganizationInvitation


class OrganizationTests(TestCase):
    """Test organization creation and membership"""
    
    def setUp(self):
        """Create test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        self.client = APIClient()
    
    def test_create_organization(self):
        """Test creating a new organization"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/organizations/', {
            'name': 'My New Org'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Organization.objects.count(), 1)
        
        # Creator should be admin
        membership = OrganizationMember.objects.get(
            organization__name='My New Org',
            user=self.user
        )
        self.assertEqual(membership.role, 'ADMIN')
    
    def test_list_only_user_organizations(self):
        """Test that users only see their own organizations"""
        # Create another user
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@test.com',
            password='pass123'
        )
        
        # Create org for current user
        org1 = Organization.objects.create(name='My Org')
        OrganizationMember.objects.create(
            organization=org1,
            user=self.user,
            role='ADMIN'
        )
        
        # Create org for other user
        org2 = Organization.objects.create(name='Other Org')
        OrganizationMember.objects.create(
            organization=org2,
            user=other_user,
            role='ADMIN'
        )
        
        # Login as current user
        self.client.force_authenticate(user=self.user)
        
        # Get organizations
        response = self.client.get('/api/organizations/')
        
        # Should only see own organization
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if results exist (could be paginated)
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
            self.assertEqual(response.data['results'][0]['name'], 'My Org')
        else:
            # Non-paginated response
            self.assertEqual(len(response.data), 1)
            self.assertEqual(response.data[0]['name'], 'My Org')


class InvitationTests(TestCase):
    """Test organization invitation functionality"""
    
    def setUp(self):
        """Create test data"""
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123'
        )
        self.editor_user = User.objects.create_user(
            username='editor',
            email='editor@test.com',
            password='testpass123'
        )
        self.viewer_user = User.objects.create_user(
            username='viewer',
            email='viewer@test.com',
            password='testpass123'
        )
        self.new_user_email = 'newuser@test.com'
        
        self.organization = Organization.objects.create(name='Test Org')
        OrganizationMember.objects.create(
            organization=self.organization,
            user=self.admin_user,
            role='ADMIN'
        )
        OrganizationMember.objects.create(
            organization=self.organization,
            user=self.editor_user,
            role='EDITOR'
        )
        OrganizationMember.objects.create(
            organization=self.organization,
            user=self.viewer_user,
            role='VIEWER'
        )
        
        self.client = APIClient()
    
    def test_admin_can_invite_user(self):
        """Test that admin can invite a user"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/organizations/{self.organization.id}/invite/',
            {
                'email': self.new_user_email,
                'role': 'VIEWER'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(OrganizationInvitation.objects.filter(
            organization=self.organization,
            email=self.new_user_email
        ).exists())
    
    def test_non_admin_cannot_invite(self):
        """Test that non-admin users cannot invite"""
        self.client.force_authenticate(user=self.editor_user)
        
        response = self.client.post(
            f'/api/organizations/{self.organization.id}/invite/',
            {
                'email': self.new_user_email,
                'role': 'VIEWER'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_cannot_invite_existing_member(self):
        """Test that you cannot invite a user who is already a member"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post(
            f'/api/organizations/{self.organization.id}/invite/',
            {
                'email': self.editor_user.email,
                'role': 'VIEWER'
            }
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already a member', str(response.data))
    
    def test_validate_invitation_token(self):
        """Test invitation token validation"""
        invitation = OrganizationInvitation.objects.create(
            email=self.new_user_email,
            organization=self.organization,
            role='VIEWER',
            invited_by=self.admin_user
        )
        
        response = self.client.get(f'/api/invitations/{invitation.token}/validate/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['email'], self.new_user_email)
    
    def test_validate_expired_invitation(self):
        """Test that expired invitations are invalid"""
        invitation = OrganizationInvitation.objects.create(
            email=self.new_user_email,
            organization=self.organization,
            role='VIEWER',
            invited_by=self.admin_user,
            expires_at=timezone.now() - timedelta(days=1)
        )
        
        response = self.client.get(f'/api/invitations/{invitation.token}/validate/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])
    
    def test_accept_invitation_new_user(self):
        """Test accepting invitation during registration"""
        invitation = OrganizationInvitation.objects.create(
            email=self.new_user_email,
            organization=self.organization,
            role='EDITOR',
            invited_by=self.admin_user
        )
        
        # Register new user with invite token
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': self.new_user_email,
            'password': 'SecurePass123',
            'password2': 'SecurePass123',
            'invite_token': invitation.token
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get('invitation_accepted', False))
        
        # Check that user is now a member
        new_user = User.objects.get(email=self.new_user_email)
        self.assertTrue(OrganizationMember.objects.filter(
            organization=self.organization,
            user=new_user,
            role='EDITOR'
        ).exists())
        
        # Check invitation is marked as accepted
        invitation.refresh_from_db()
        self.assertEqual(invitation.status, 'ACCEPTED')
    
    def test_accept_invitation_existing_user(self):
        """Test accepting invitation during login"""
        existing_user = User.objects.create_user(
            username='existing',
            email=self.new_user_email,
            password='testpass123'
        )
        
        invitation = OrganizationInvitation.objects.create(
            email=self.new_user_email,
            organization=self.organization,
            role='EDITOR',
            invited_by=self.admin_user
        )
        
        # Login with invite token
        response = self.client.post('/api/auth/login/', {
            'username': 'existing',
            'password': 'testpass123',
            'invite_token': invitation.token
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('invitation_accepted', False))
        
        # Check that user is now a member
        self.assertTrue(OrganizationMember.objects.filter(
            organization=self.organization,
            user=existing_user,
            role='EDITOR'
        ).exists())
    
    def test_cannot_accept_with_wrong_email(self):
        """Test that invitation cannot be accepted with different email"""
        invitation = OrganizationInvitation.objects.create(
            email='correct@test.com',
            organization=self.organization,
            role='VIEWER',
            invited_by=self.admin_user
        )
        
        # Try to register with different email
        response = self.client.post('/api/auth/register/', {
            'username': 'wronguser',
            'email': 'wrong@test.com',
            'password': 'SecurePass123',
            'password2': 'SecurePass123',
            'invite_token': invitation.token
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('invite_token', response.data)
    
    def test_admin_can_promote_viewer_to_editor(self):
        """Test that admin can promote viewer to editor"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.patch(
            f'/api/organizations/{self.organization.id}/members/{self.viewer_user.organization_memberships.first().id}/',
            {'role': 'EDITOR'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.viewer_user.organization_memberships.first().refresh_from_db()
        self.assertEqual(self.viewer_user.organization_memberships.first().role, 'EDITOR')
    
    def test_admin_can_promote_editor_to_admin(self):
        """Test that admin can promote editor to admin"""
        self.client.force_authenticate(user=self.admin_user)
        
        editor_member = self.editor_user.organization_memberships.first()
        response = self.client.patch(
            f'/api/organizations/{self.organization.id}/members/{editor_member.id}/',
            {'role': 'ADMIN'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        editor_member.refresh_from_db()
        self.assertEqual(editor_member.role, 'ADMIN')
    
    def test_non_admin_cannot_update_roles(self):
        """Test that non-admin users cannot update member roles"""
        self.client.force_authenticate(user=self.editor_user)
        
        viewer_member = self.viewer_user.organization_memberships.first()
        response = self.client.patch(
            f'/api/organizations/{self.organization.id}/members/{viewer_member.id}/',
            {'role': 'EDITOR'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_cannot_demote_only_admin(self):
        """Test that the only admin cannot demote themselves"""
        # Create organization with only one admin
        solo_org = Organization.objects.create(name='Solo Org')
        solo_admin = User.objects.create_user(
            username='soloadmin',
            email='solo@test.com',
            password='testpass123'
        )
        solo_member = OrganizationMember.objects.create(
            organization=solo_org,
            user=solo_admin,
            role='ADMIN'
        )
        
        self.client.force_authenticate(user=solo_admin)
        
        response = self.client.patch(
            f'/api/organizations/{solo_org.id}/members/{solo_member.id}/',
            {'role': 'EDITOR'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('only admin', str(response.data).lower())
