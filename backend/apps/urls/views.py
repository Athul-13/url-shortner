from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.shortcuts import redirect
from django.http import Http404
from django.db import models
from .models import ShortURL
from .serializers import ShortURLSerializer
from core.utils import is_organization_editor_or_admin


class ShortURLViewSet(viewsets.ModelViewSet):
    """ViewSet for short URLs"""
    permission_classes = [IsAuthenticated]
    serializer_class = ShortURLSerializer
    
    def get_queryset(self):
        """
        Optimized queryset using join instead of subquery.
        Only return URLs from namespaces in organizations where user is a member.
        Uses select_related to avoid N+1 queries when accessing namespace and created_by.
        """
        return ShortURL.objects.filter(
            namespace__organization__members__user=self.request.user
        ).select_related('namespace', 'namespace__organization', 'created_by').distinct()
    
    def list(self, request):
        """List all short URLs from user's organizations"""
        queryset = self.get_queryset()
        
        # Optional filtering by namespace with validation
        namespace_id = request.query_params.get('namespace')
        if namespace_id:
            try:
                namespace_id = int(namespace_id)
                queryset = queryset.filter(namespace_id=namespace_id)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid namespace ID'}, 
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
        """Get short URL details"""
        # Use DRF's get_object which handles 404 automatically
        short_url = self.get_object()
        serializer = self.get_serializer(short_url)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new short URL"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            short_url = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update a short URL (admin/editor only)"""
        # Use DRF's get_object which handles 404 automatically
        short_url = self.get_object()
        
        # Check if user has permission to edit
        if not is_organization_editor_or_admin(request.user, short_url.namespace.organization):
            return Response(
                {'error': 'You do not have permission to edit this URL'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(short_url, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete a short URL (admin/editor only)"""
        # Use DRF's get_object which handles 404 automatically
        short_url = self.get_object()
        
        # Check if user has permission to delete
        if not is_organization_editor_or_admin(request.user, short_url.namespace.organization):
            return Response(
                {'error': 'You do not have permission to delete this URL'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        short_url.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RedirectShortURLView(APIView):
    """Public endpoint to redirect short URLs to their original destinations"""
    permission_classes = [AllowAny]  # Public endpoint - no authentication required
    
    def get(self, request, namespace_name, short_code):
        """
        Redirect to the original URL and increment click count.
        
        Args:
            namespace_name: The namespace name
            short_code: The short code identifier
            
        Returns:
            HTTP redirect to the original URL or 404 if not found
        """
        try:
            # Look up the short URL by namespace name and short code
            short_url = ShortURL.objects.select_related('namespace').get(
                namespace__name=namespace_name,
                short_code=short_code
            )
            
            # Increment click count atomically to avoid race conditions
            ShortURL.objects.filter(pk=short_url.pk).update(
                click_count=models.F('click_count') + 1
            )
            
            # Redirect to the original URL (temporary redirect, not cached)
            return redirect(short_url.original_url, permanent=False)
            
        except ShortURL.DoesNotExist:
            raise Http404("Short URL not found")
