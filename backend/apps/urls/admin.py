from django.contrib import admin
from .models import ShortURL


@admin.register(ShortURL)
class ShortURLAdmin(admin.ModelAdmin):
    list_display = ['id', 'short_code', 'original_url', 'namespace', 'created_by', 'click_count', 'created_at']
    search_fields = ['short_code', 'original_url', 'namespace__name']
    list_filter = ['created_at', 'namespace']
    ordering = ['-created_at']
    readonly_fields = ['click_count', 'created_at', 'updated_at']
