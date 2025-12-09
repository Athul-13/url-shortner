from django.urls import path
from . import views

app_name = 'namespaces'

urlpatterns = [
    path('api/namespaces/', views.NamespaceViewSet.as_view({'get': 'list', 'post': 'create'}), name='namespace-list'),
    path('api/namespaces/<int:pk>/', views.NamespaceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update', 'delete': 'destroy'}), name='namespace-detail'),
]
