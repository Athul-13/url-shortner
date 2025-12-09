from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Namespace
from .serializers import NamespaceSerializer
from apps.organizations.models import OrganizationMember, Organization
from core.utils import is_organization_admin


class NamespaceViewSet(viewsets.ModelViewSet):
    """ViewSet for namespaces"""
    permission_classes = [IsAuthenticated]
    serializer_class = NamespaceSerializer
    
    def get_queryset(self):
        """
        Optimized queryset using join instead of subquery.
        Only return namespaces from organizations where user is a member.
        Uses select_related to avoid N+1 queries when accessing organization.name
        """
        return Namespace.objects.filter(
            organization__members__user=self.request.user
        ).select_related('organization').distinct()
    
    def list(self, request):
        """List all namespaces from user's organizations"""
        queryset = self.get_queryset()
        
        # Optional filtering by organization with validation
        organization_id = request.query_params.get('organization')
        if organization_id:
            try:
                organization_id = int(organization_id)
                queryset = queryset.filter(organization_id=organization_id)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid organization ID'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Let DRF handle pagination automatically
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get namespace details"""
        # Use DRF's get_object which handles 404 automatically
        namespace = self.get_object()
        serializer = self.get_serializer(namespace)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new namespace (admin only)"""
        # Check if organization is provided
        organization_id = request.data.get('organization')
        if not organization_id:
            return Response(
                {'error': 'Organization is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate organization_id is an integer
        try:
            organization_id = int(organization_id)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid organization ID'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get organization and check membership
        organization = get_object_or_404(
            Organization.objects.filter(
                members__user=request.user
            ),
            pk=organization_id
        )
        
        # Check if user is an admin of the organization
        if not is_organization_admin(request.user, organization):
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
        # Use DRF's get_object which handles 404 automatically
        namespace = self.get_object()
        
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
    
    def destroy(self, request, pk=None):
        """Delete a namespace (admin only)"""
        # Use DRF's get_object which handles 404 automatically
        namespace = self.get_object()
        
        # Check if user is an admin of the organization
        if not self._is_organization_admin(namespace.organization):
            return Response(
                {'error': 'You must be an admin to delete namespaces'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        namespace.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
