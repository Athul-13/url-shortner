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

export interface OrganizationInvitation {
  id: number;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  invited_by_username: string;
  organization_name: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  token: string;
}

export interface CreateOrganizationData {
  name: string;
}

export interface InviteUserData {
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface UpdateMemberRoleData {
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export interface InvitationValidationResponse {
  valid: boolean;
  email?: string;
  organization_name?: string;
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
  error?: string;
}

export interface InvitationAcceptResponse {
  success: boolean;
  organization_id: number;
  organization_name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const response = await apiClient.get(ORGANIZATIONS_LIST);
    // Handle paginated response (DRF format)
    if (response.data.results) {
      return response.data.results;
    }
    // Handle non-paginated response (fallback)
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

  async inviteUser(orgId: number, data: InviteUserData): Promise<OrganizationInvitation> {
    const response = await apiClient.post(`${ORGANIZATIONS_DETAIL(orgId)}invite/`, data);
    return response.data;
  },

  async updateMemberRole(orgId: number, memberId: number, data: UpdateMemberRoleData): Promise<OrganizationMember> {
    const response = await apiClient.patch(`${ORGANIZATIONS_DETAIL(orgId)}members/${memberId}/`, data);
    return response.data;
  },

  async validateInvitation(token: string): Promise<InvitationValidationResponse> {
    const response = await apiClient.get(`/api/invitations/${token}/validate/`);
    return response.data;
  },

  async acceptInvitation(token: string): Promise<InvitationAcceptResponse> {
    const response = await apiClient.post(`/api/invitations/${token}/accept/`);
    return response.data;
  },
};
