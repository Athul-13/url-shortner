from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.organizations.models import Organization, OrganizationMember
from apps.namespaces.models import Namespace
from apps.urls.models import ShortURL


class ShortURLTests(TestCase):
    """Test short URL creation and redirection"""
    
    def setUp(self):
        """Create test data before each test"""
        # Create a user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        # Create organization
        self.org = Organization.objects.create(name='Test Org')
        
        # Make user an editor
        OrganizationMember.objects.create(
            organization=self.org,
            user=self.user,
            role='EDITOR'
        )
        
        # Create namespace
        self.namespace = Namespace.objects.create(
            name='test-namespace',
            organization=self.org
        )
        
        # Set up API client
        self.client = APIClient()
    
    def test_create_short_url(self):
        """Test that authenticated editor can create a short URL"""
        # Login
        self.client.force_authenticate(user=self.user)
        
        # Create short URL
        response = self.client.post('/api/urls/', {
            'original_url': 'https://example.com',
            'namespace': self.namespace.id,
            'short_code': 'test123'
        })
        
        # Check it worked
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ShortURL.objects.count(), 1)
        
        short_url = ShortURL.objects.first()
        self.assertEqual(short_url.short_code, 'test123')
        self.assertEqual(short_url.original_url, 'https://example.com')
        self.assertEqual(short_url.namespace, self.namespace)
    
    def test_redirect_increments_click_count(self):
        """Test that accessing short URL redirects and increments click count"""
        # Create a short URL
        short_url = ShortURL.objects.create(
            original_url='https://google.com',
            short_code='abc123',
            namespace=self.namespace,
            created_by=self.user
        )
        
        initial_count = short_url.click_count
        
        # Access the short URL (public endpoint, no auth needed)
        response = self.client.get(f'/{self.namespace.name}/abc123/')
        
        # Should redirect (302)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, 'https://google.com')
        
        # Click count should increase
        short_url.refresh_from_db()
        self.assertEqual(short_url.click_count, initial_count + 1)
