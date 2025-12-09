from django.urls import path
from . import views

app_name = 'organizations'

urlpatterns = [
    path('api/organizations/', views.OrganizationViewSet.as_view({'get': 'list', 'post': 'create'}), name='organization-list'),
    path('api/organizations/<int:pk>/', views.OrganizationViewSet.as_view({'get': 'retrieve'}), name='organization-detail'),
]
