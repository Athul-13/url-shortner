from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'namespaces'

router = DefaultRouter()
router.register(r'api/namespaces', views.NamespaceViewSet, basename='namespace')

urlpatterns = [
    path('', include(router.urls)),
]
