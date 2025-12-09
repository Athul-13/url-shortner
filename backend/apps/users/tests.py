from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class UserAuthTests(TestCase):
    """Test user registration and login"""
    
    def setUp(self):
        """Create test client"""
        self.client = APIClient()
    
    def test_register_new_user(self):
        """Test user registration"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@test.com',
            'password': 'securepass123',
            'password2': 'securepass123'  # Confirm password field required
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        
        # Check response contains tokens (nested in 'tokens' key)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
    
    def test_login_with_correct_password(self):
        """Test login with valid credentials"""
        # Create user
        User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='password123'
        )
        
        # Login
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Tokens are nested in 'tokens' key
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
