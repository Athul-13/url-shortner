from django.urls import path
from . import views
from core.constants import AUTH_REGISTER, AUTH_LOGIN, AUTH_ME

app_name = 'users'

urlpatterns = [
    path(AUTH_REGISTER, views.register, name='register'),
    path(AUTH_LOGIN, views.login, name='login'),
    path(AUTH_ME, views.me, name='me'),
]
