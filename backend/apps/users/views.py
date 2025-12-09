from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from apps.organizations.utils import accept_invitation


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and automatically create an organization"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        invite_token = request.data.get('invite_token')
        user = serializer.save()
        
        # Try to accept invitation if token was provided
        invitation_accepted = False
        organization_id = None
        if invite_token:
            try:
                invitation = accept_invitation(user, invite_token)
                invitation_accepted = True
                organization_id = invitation.organization.id
            except Exception as e:
                # If invitation fails, still register the user
                # Error details will be in the exception
                pass
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Return user data and tokens
        user_serializer = UserSerializer(user)
        response_data = {
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'is_new_user': True,
        }
        
        if invitation_accepted:
            response_data['invitation_accepted'] = True
            response_data['organization_id'] = organization_id
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        invite_token = request.data.get('invite_token')
        
        user = authenticate(username=username, password=password)
        if user:
            # Try to accept invitation if token was provided
            invitation_accepted = False
            organization_id = None
            if invite_token:
                try:
                    invitation = accept_invitation(user, invite_token)
                    invitation_accepted = True
                    organization_id = invitation.organization.id
                except Exception as e:
                    # If invitation fails, still login the user
                    # Error details will be in the exception
                    pass
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return user data and tokens
            user_serializer = UserSerializer(user)
            response_data = {
                'user': user_serializer.data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
            }
            
            if invitation_accepted:
                response_data['invitation_accepted'] = True
                response_data['organization_id'] = organization_id
            
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
