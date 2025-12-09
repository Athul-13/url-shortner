"""
API endpoint constants - All URLs should be defined here
No hardcoded URLs should exist elsewhere in the codebase
"""

# Authentication endpoints
AUTH_REGISTER = 'api/auth/register/'
AUTH_LOGIN = 'api/auth/login/'
AUTH_ME = 'api/auth/me/'
AUTH_REFRESH = 'api/auth/refresh/'

# Organization endpoints
ORGANIZATIONS_LIST = 'api/organizations/'
ORGANIZATIONS_DETAIL = 'api/organizations/<int:pk>/'

# Namespace endpoints
NAMESPACES_LIST = 'api/namespaces/'
NAMESPACES_DETAIL = 'api/namespaces/<int:pk>/'

# Short URL endpoints
URLS_LIST = 'api/urls/'
URLS_DETAIL = 'api/urls/<int:pk>/'
URLS_BULK = 'api/urls/bulk/'
