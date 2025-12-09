/**
 * Application route constants
 * All route paths must be defined here - no hardcoded routes elsewhere
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  CREATE_ORGANIZATION: '/create-organization',
  ORGANIZATION_DETAIL: (id: number) => `/organizations/${id}`,
  NAMESPACES: '/namespaces',
  INVITE: (token: string) => `/invite/${token}`,
} as const;
