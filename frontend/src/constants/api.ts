/**
 * API endpoint constants
 * All API URLs must be defined here - no hardcoded URLs elsewhere
 */

// Base URL from environment
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

// API path prefixes
const API_PREFIX = '/api';

// Create endpoint builder helper
const createEndpoint = (path: string) => `${API_BASE_URL}${API_PREFIX}${path}`;
const createDetailEndpoint = (basePath: string) => (id: number) => 
  `${API_BASE_URL}${API_PREFIX}${basePath}/${id}/`;

// API Endpoints organized by resource
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: createEndpoint('/auth/register/'),
    LOGIN: createEndpoint('/auth/login/'),
    ME: createEndpoint('/auth/me/'),
    REFRESH: createEndpoint('/auth/refresh/'),
  },
  ORGANIZATIONS: {
    LIST: createEndpoint('/organizations/'),
    DETAIL: createDetailEndpoint('/organizations'),
  },
  NAMESPACES: {
    LIST: createEndpoint('/namespaces/'),
    DETAIL: createDetailEndpoint('/namespaces'),
  },
  URLS: {
    LIST: createEndpoint('/urls/'),
    DETAIL: createDetailEndpoint('/urls'),
    BULK: createEndpoint('/urls/bulk/'),
  },
} as const;

// Export individual constants for backward compatibility and convenience
export const AUTH_REGISTER = API_ENDPOINTS.AUTH.REGISTER;
export const AUTH_LOGIN = API_ENDPOINTS.AUTH.LOGIN;
export const AUTH_ME = API_ENDPOINTS.AUTH.ME;
export const AUTH_REFRESH = API_ENDPOINTS.AUTH.REFRESH;

export const ORGANIZATIONS_LIST = API_ENDPOINTS.ORGANIZATIONS.LIST;
export const ORGANIZATIONS_DETAIL = API_ENDPOINTS.ORGANIZATIONS.DETAIL;

export const NAMESPACES_LIST = API_ENDPOINTS.NAMESPACES.LIST;
export const NAMESPACES_DETAIL = API_ENDPOINTS.NAMESPACES.DETAIL;

export const URLS_LIST = API_ENDPOINTS.URLS.LIST;
export const URLS_DETAIL = API_ENDPOINTS.URLS.DETAIL;
export const URLS_BULK = API_ENDPOINTS.URLS.BULK;
