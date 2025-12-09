from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Namespace
from .serializers import NamespaceSerializer
from apps.organizations.models import OrganizationMember, Organization


class NamespaceViewSet(viewsets.ModelViewSet):
    """ViewSet for namespaces"""
    permission_classes = [IsAuthenticated]
    serializer_class = NamespaceSerializer
    
    def get_queryset(self):
        # Only return namespaces from organizations where user is a member
        user_orgs = OrganizationMember.objects.filter(user=self.request.user).values_list('organization', flat=True)
        return Namespace.objects.filter(organization__in=user_orgs)
    
    def _is_organization_admin(self, organization):
        """Helper method to check if user is an admin of the organization"""
        return OrganizationMember.objects.filter(
            organization=organization,
            user=self.request.user,
            role='ADMIN'
        ).exists()
    
    def list(self, request):
        """List all namespaces from user's organizations"""
        queryset = self.get_queryset()
        
        # Optional filtering by organization
        organization_id = request.query_params.get('organization')
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get namespace details"""
        try:
            namespace = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(namespace)
            return Response(serializer.data)
        except Namespace.DoesNotExist:
            return Response(
                {'error': 'Namespace not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """Create a new namespace (admin only)"""
        # Check if organization is provided and user is admin
        organization_id = request.data.get('organization')
        if not organization_id:
            return Response(
                {'error': 'Organization is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            organization = Organization.objects.get(pk=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is an admin of the organization
        if not self._is_organization_admin(organization):
            return Response(
                {'error': 'You must be an admin to create namespaces'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            namespace = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update a namespace (admin only)"""
        try:
            namespace = self.get_queryset().get(pk=pk)
            
            # Check if user is an admin of the organization
            if not self._is_organization_admin(namespace.organization):
                return Response(
                    {'error': 'You must be an admin to update namespaces'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(namespace, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Namespace.DoesNotExist:
            return Response(
                {'error': 'Namespace not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, pk=None):
        """Delete a namespace (admin only)"""
        try:
            namespace = self.get_queryset().get(pk=pk)
            
            # Check if user is an admin of the organization
            if not self._is_organization_admin(namespace.organization):
                return Response(
                    {'error': 'You must be an admin to delete namespaces'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            namespace.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Namespace.DoesNotExist:
            return Response(
                {'error': 'Namespace not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
