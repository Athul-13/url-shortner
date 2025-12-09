from rest_framework import serializers
from .models import ShortURL
from apps.namespaces.models import Namespace
from apps.organizations.models import OrganizationMember
from django.conf import settings
import random
import string


class ShortURLSerializer(serializers.ModelSerializer):
    """Serializer for short URLs"""
    namespace_name = serializers.CharField(source='namespace.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ShortURL
        fields = [
            'id', 'original_url', 'short_code', 'namespace', 'namespace_name',
            'created_by', 'created_by_username', 'created_at', 'updated_at', 'click_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'click_count', 'created_by', 'namespace_name', 'created_by_username']
    
    def validate_namespace(self, value):
        # Check if user has at least editor role in the namespace's organization
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = OrganizationMember.objects.filter(
                organization=value.organization,
                user=request.user,
                role__in=['ADMIN', 'EDITOR']
            ).first()
            if not member:
                raise serializers.ValidationError("You must be an admin or editor to create URLs.")
        return value
    
    def validate(self, attrs):
        # If short_code is not provided, generate one
        if not attrs.get('short_code'):
            namespace = attrs.get('namespace')
            attrs['short_code'] = self._generate_short_code(namespace)
        else:
            # Check if short_code is unique within the namespace
            namespace = attrs.get('namespace')
            short_code = attrs.get('short_code')
            
            # Check for uniqueness
            exists = ShortURL.objects.filter(
                namespace=namespace,
                short_code=short_code
            ).exists()
            
            # If updating, exclude current instance
            if self.instance:
                exists = exists and not ShortURL.objects.filter(
                    namespace=namespace,
                    short_code=short_code,
                    pk=self.instance.pk
                ).exists()
            
            if exists:
                raise serializers.ValidationError({
                    'short_code': 'This short code is already taken in this namespace.'
                })
        
        return attrs
    
    def _generate_short_code(self, namespace):
        """Generate a random short code"""
        length = settings.SHORT_CODE_LENGTH
        charset = settings.SHORT_CODE_CHARSET
        
        max_attempts = 10
        for _ in range(max_attempts):
            short_code = ''.join(random.choices(charset, k=length))
            if not ShortURL.objects.filter(namespace=namespace, short_code=short_code).exists():
                return short_code
        
        raise serializers.ValidationError("Unable to generate unique short code. Please try again.")
    
    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
