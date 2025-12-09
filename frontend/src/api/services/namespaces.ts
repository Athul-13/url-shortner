import apiClient from '../client';
import { NAMESPACES_LIST, NAMESPACES_DETAIL } from '../../constants/api';

export interface Namespace {
  id: number;
  name: string;
  organization: number;
  organization_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNamespaceData {
  name: string;
  organization: number;
}

export interface UpdateNamespaceData {
  name: string;
}

export const namespaceService = {
  async getAll(organizationId?: number): Promise<Namespace[]> {
    const params = organizationId ? { organization: organizationId } : {};
    const response = await apiClient.get(NAMESPACES_LIST, { params });
    // Handle paginated response (DRF format)
    if (response.data.results) {
      return response.data.results;
    }
    // Handle non-paginated response (fallback)
    return response.data;
  },

  async getById(id: number): Promise<Namespace> {
    const response = await apiClient.get(NAMESPACES_DETAIL(id));
    return response.data;
  },

  async create(data: CreateNamespaceData): Promise<Namespace> {
    const response = await apiClient.post(NAMESPACES_LIST, data);
    return response.data;
  },

  async update(id: number, data: UpdateNamespaceData): Promise<Namespace> {
    const response = await apiClient.put(NAMESPACES_DETAIL(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(NAMESPACES_DETAIL(id));
  },
};

