from django.contrib import admin
from .models import Namespace


@admin.register(Namespace)
class NamespaceAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'organization', 'created_at', 'updated_at']
    search_fields = ['name', 'organization__name']
    list_filter = ['created_at']
    ordering = ['-created_at']
