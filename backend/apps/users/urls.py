from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/me/', views.me, name='me'),
]
