from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'organizations'

router = DefaultRouter()
router.register(r'api/organizations', views.OrganizationViewSet, basename='organization')
router.register(r'api/invitations', views.InvitationViewSet, basename='invitation')

urlpatterns = [
    path('', include(router.urls)),
]
