from rest_framework import serializers
from .models import Organization, OrganizationMember
from django.contrib.auth.models import User


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Serializer for organization members"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = OrganizationMember
        fields = ['id', 'user', 'username', 'email', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at', 'username', 'email']


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for organizations"""
    members = OrganizationMemberSerializer(many=True, read_only=True)
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = ['id', 'name', 'created_at', 'updated_at', 'members', 'user_role']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = OrganizationMember.objects.filter(
                organization=obj,
                user=request.user
            ).first()
            return member.role if member else None
        return None


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating organizations"""
    class Meta:
        model = Organization
        fields = ['name']
    
    def create(self, validated_data):
        # Create organization and add current user as admin
        organization = Organization.objects.create(**validated_data)
        user = self.context['request'].user
        OrganizationMember.objects.create(
            user=user,
            organization=organization,
            role='ADMIN'
        )
        return organization
