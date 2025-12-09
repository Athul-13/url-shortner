import apiClient from '../client';
import { ORGANIZATIONS_LIST, ORGANIZATIONS_DETAIL } from '../../constants/api';

export interface Organization {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  user_role: 'ADMIN' | 'EDITOR' | 'VIEWER' | null;
  members?: OrganizationMember[];
}

export interface OrganizationMember {
  id: number;
  user: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  joined_at: string;
}

export interface CreateOrganizationData {
  name: string;
}

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const response = await apiClient.get(ORGANIZATIONS_LIST);
    return response.data;
  },

  async getById(id: number): Promise<Organization> {
    const response = await apiClient.get(ORGANIZATIONS_DETAIL(id));
    return response.data;
  },

  async create(data: CreateOrganizationData): Promise<Organization> {
    const response = await apiClient.post(ORGANIZATIONS_LIST, data);
    return response.data;
  },
};
