from django.db import models
from django.contrib.auth.models import User
from apps.namespaces.models import Namespace


class ShortURL(models.Model):
    """Short URL model - stores shortened URLs"""
    original_url = models.URLField(max_length=2048, unique=True)
    short_code = models.CharField(max_length=255, unique=True)
    namespace = models.ForeignKey(Namespace, on_delete=models.CASCADE, related_name='short_urls')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_urls')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    click_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['namespace', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.short_code} -> {self.original_url}"
