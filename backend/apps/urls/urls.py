from django.urls import path
from . import views

app_name = 'urls'

urlpatterns = [
    path('api/urls/', views.ShortURLViewSet.as_view({'get': 'list', 'post': 'create'}), name='url-list'),
    path('api/urls/<int:pk>/', views.ShortURLViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='url-detail'),
]
