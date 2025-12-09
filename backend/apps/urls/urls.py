from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'urls'

router = DefaultRouter()
router.register(r'api/urls', views.ShortURLViewSet, basename='url')

urlpatterns = [
    path('', include(router.urls)),
    # Public redirect endpoint - must be after API routes
    path('<str:namespace_name>/<str:short_code>/', views.RedirectShortURLView.as_view(), name='redirect'),
]
