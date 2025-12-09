import apiClient from '../client';
import { URLS_LIST, URLS_DETAIL } from '../../constants/api';

export interface ShortURL {
  id: number;
  original_url: string;
  short_code: string;
  namespace: number;
  namespace_name: string;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
  click_count: number;
}

export interface CreateShortURLData {
  original_url: string;
  short_code?: string;
  namespace: number;
}

export interface UpdateShortURLData {
  original_url?: string;
  short_code?: string;
}

export const urlService = {
  async getAll(namespaceId?: number): Promise<ShortURL[]> {
    const params = namespaceId ? { namespace: namespaceId } : {};
    const response = await apiClient.get(URLS_LIST, { params });
    // Handle paginated response (DRF format)
    if (response.data.results) {
      return response.data.results;
    }
    // Handle non-paginated response (fallback)
    return response.data;
  },

  async getById(id: number): Promise<ShortURL> {
    const response = await apiClient.get(URLS_DETAIL(id));
    return response.data;
  },

  async create(data: CreateShortURLData): Promise<ShortURL> {
    const response = await apiClient.post(URLS_LIST, data);
    return response.data;
  },

  async update(id: number, data: UpdateShortURLData): Promise<ShortURL> {
    const response = await apiClient.put(URLS_DETAIL(id), data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(URLS_DETAIL(id));
  },
};
