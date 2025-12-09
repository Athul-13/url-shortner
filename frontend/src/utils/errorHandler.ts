/**
 * Utility function to extract error messages from API errors
 */
import type { AxiosErrorResponse } from '../types/api';

export const getErrorMessage = (
  error: unknown,
  defaultMessage: string
): string => {
  const apiError = error as AxiosErrorResponse;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    apiError.response?.data?.detail ||
    defaultMessage
  );
};
