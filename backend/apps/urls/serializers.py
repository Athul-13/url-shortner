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
        # Check if original_url already exists (global uniqueness)
        original_url = attrs.get('original_url')
        if original_url:
            existing_url = ShortURL.objects.filter(original_url=original_url)
            # If updating, exclude current instance
            if self.instance:
                existing_url = existing_url.exclude(pk=self.instance.pk)
            
            if existing_url.exists():
                existing = existing_url.first()
                raise serializers.ValidationError({
                    'original_url': f'This URL has already been shortened as: {existing.namespace.name}/{existing.short_code}'
                })
        
        # If short_code is not provided, generate one
        if not attrs.get('short_code'):
            attrs['short_code'] = self._generate_short_code()
        else:
            # Check if short_code is globally unique
            short_code = attrs.get('short_code')
            
            # Check for global uniqueness
            exists = ShortURL.objects.filter(short_code=short_code)
            
            # If updating, exclude current instance
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            
            if exists.exists():
                raise serializers.ValidationError({
                    'short_code': 'This short code is already taken. Please choose a different one.'
                })
        
        return attrs
    
    def _generate_short_code(self):
        """Generate a globally unique random short code"""
        length = settings.SHORT_CODE_LENGTH
        charset = settings.SHORT_CODE_CHARSET
        
        max_attempts = 10
        for _ in range(max_attempts):
            short_code = ''.join(random.choices(charset, k=length))
            # Check for global uniqueness
            if not ShortURL.objects.filter(short_code=short_code).exists():
                return short_code
        
        raise serializers.ValidationError("Unable to generate unique short code. Please try again.")
    
    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
