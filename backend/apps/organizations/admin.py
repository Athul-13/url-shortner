from django.contrib import admin
from .models import Organization, OrganizationMember


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at', 'updated_at']
    search_fields = ['name']
    list_filter = ['created_at']
    ordering = ['-created_at']


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'organization', 'role', 'joined_at']
    search_fields = ['user__username', 'organization__name']
    list_filter = ['role', 'joined_at']
    ordering = ['-joined_at']
