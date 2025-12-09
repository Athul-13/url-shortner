from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization, OrganizationMember
from apps.namespaces.models import Namespace


class NamespaceTests(TestCase):
    """Test namespace creation and permissions"""
    
    def setUp(self):
        """Create test data"""
        # Create admin user
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='pass123'
        )
        
        # Create editor user
        self.editor = User.objects.create_user(
            username='editor',
            email='editor@test.com',
            password='pass123'
        )
        
        # Create organization
        self.org = Organization.objects.create(name='Test Org')
        
        # Add members
        OrganizationMember.objects.create(
            organization=self.org,
            user=self.admin,
            role='ADMIN'
        )
        OrganizationMember.objects.create(
            organization=self.org,
            user=self.editor,
            role='EDITOR'
        )
        
        self.client = APIClient()
    
    def test_admin_can_create_namespace(self):
        """Test that admin can create namespace"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.post('/api/namespaces/', {
            'name': 'new-namespace',
            'organization': self.org.id
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Namespace.objects.count(), 1)
        self.assertEqual(Namespace.objects.first().name, 'new-namespace')
    
    def test_editor_cannot_create_namespace(self):
        """Test that editor cannot create namespace (admin only)"""
        self.client.force_authenticate(user=self.editor)
        
        response = self.client.post('/api/namespaces/', {
            'name': 'new-namespace',
            'organization': self.org.id
        })
        
        # Serializer validation returns 400 with error message (not 403)
        # This is correct - validation happens before permission check
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('organization', response.data)
        self.assertIn('admin', str(response.data['organization'][0]).lower())
        self.assertEqual(Namespace.objects.count(), 0)
