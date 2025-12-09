from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Organization, OrganizationMember
from .serializers import OrganizationSerializer, OrganizationCreateSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for organizations"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        # Only return organizations where user is a member
        return Organization.objects.filter(
            members__user=self.request.user
        ).distinct()
    
    def list(self, request):
        """List all organizations where user is a member"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Get organization details"""
        try:
            organization = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(organization)
            return Response(serializer.data)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def create(self, request):
        """Create a new organization"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            organization = serializer.save()
            response_serializer = OrganizationSerializer(organization, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
