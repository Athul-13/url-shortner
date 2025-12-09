/**
 * API error response types
 */
export interface ApiError {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
}

export interface AxiosErrorResponse {
  response?: {
    data?: ApiError;
    status?: number;
  };
  message?: string;
}
