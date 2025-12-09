from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization, OrganizationMember


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
