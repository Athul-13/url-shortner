from rest_framework import serializers
from .models import Namespace
from apps.organizations.models import OrganizationMember


class NamespaceSerializer(serializers.ModelSerializer):
    """Serializer for namespaces"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Namespace
        fields = ['id', 'name', 'organization', 'organization_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'organization_name']
    
    def validate_name(self, value):
        # Check if namespace is globally unique
        if Namespace.objects.filter(name=value).exists():
            if self.instance and self.instance.name == value:
                return value
            raise serializers.ValidationError("This namespace is already taken.")
        return value
    
    def validate_organization(self, value):
        # Prevent changing organization on update
        if self.instance and self.instance.organization != value:
            raise serializers.ValidationError("Cannot change the organization of an existing namespace.")
        
        # Check if user is an admin of the organization
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = OrganizationMember.objects.filter(
                organization=value,
                user=request.user,
                role='ADMIN'
            ).first()
            if not member:
                raise serializers.ValidationError("You must be an admin to create namespaces.")
        return value
