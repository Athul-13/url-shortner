from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'organizations'

router = DefaultRouter()
router.register(r'api/organizations', views.OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
]
