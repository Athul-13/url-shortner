from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import ShortURL
from .serializers import ShortURLSerializer
from apps.organizations.models import OrganizationMember


class ShortURLViewSet(viewsets.ModelViewSet):
    """ViewSet for short URLs"""
    permission_classes = [IsAuthenticated]
    serializer_class = ShortURLSerializer
    
    def get_queryset(self):
        # Only return URLs from namespaces in organizations where user is a member
        user_orgs = OrganizationMember.objects.filter(user=self.request.user).values_list('organization', flat=True)
        return ShortURL.objects.filter(namespace__organization__in=user_orgs)
    
    def list(self, request):
        """List all short URLs from user's organizations"""
        queryset = self.get_queryset()
        
        # Optional filtering by namespace
        namespace_id = request.query_params.get('namespace')
        if namespace_id:
            queryset = queryset.filter(namespace_id=namespace_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get short URL details"""
        try:
            short_url = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(short_url)
            return Response(serializer.data)
        except ShortURL.DoesNotExist:
            return Response(
                {'error': 'Short URL not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """Create a new short URL"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            short_url = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update a short URL"""
        try:
            short_url = self.get_queryset().get(pk=pk)
            
            # Check if user has permission to edit
            member = OrganizationMember.objects.filter(
                organization=short_url.namespace.organization,
                user=request.user,
                role__in=['ADMIN', 'EDITOR']
            ).first()
            
            if not member:
                return Response(
                    {'error': 'You do not have permission to edit this URL'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(short_url, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ShortURL.DoesNotExist:
            return Response(
                {'error': 'Short URL not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, pk=None):
        """Delete a short URL"""
        try:
            short_url = self.get_queryset().get(pk=pk)
            
            # Check if user has permission to delete
            member = OrganizationMember.objects.filter(
                organization=short_url.namespace.organization,
                user=request.user,
                role__in=['ADMIN', 'EDITOR']
            ).first()
            
            if not member:
                return Response(
                    {'error': 'You do not have permission to delete this URL'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            short_url.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ShortURL.DoesNotExist:
            return Response(
                {'error': 'Short URL not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
