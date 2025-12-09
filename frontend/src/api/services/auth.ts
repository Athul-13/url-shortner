import apiClient from '../client';
import { AUTH_REGISTER, AUTH_LOGIN, AUTH_ME } from '../../constants/api';
import { setTokens, clearTokens } from '../../utils/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  is_new_user?: boolean;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(AUTH_REGISTER, data);
    const { tokens } = response.data;
    setTokens(tokens.access, tokens.refresh);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post(AUTH_LOGIN, data);
    const { tokens } = response.data;
    setTokens(tokens.access, tokens.refresh);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(AUTH_ME);
    return response.data;
  },

  logout() {
    clearTokens();
  },
};
