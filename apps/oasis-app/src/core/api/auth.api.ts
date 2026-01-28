/**
 * Auth Service API Client (Port 8001)
 */

import { createApiClient, type ApiClient } from './client';
import { SERVICES } from '@/core/config/services';
import type {
  Profile,
  Organization,
  OrganizationMember,
  OrganizationMemberWithProfile,
  InviteMemberPayload,
  OrganizationRole,
} from '@/core/types';
import type { ApiResponse } from './types';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  invitation_token?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  message: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  type: 'community' | 'provider' | 'sponsor' | 'enterprise';
}

// ============================================================================
// Auth API Client
// ============================================================================

export function createAuthApi(
  getAccessToken?: () => Promise<string | null>,
  getOrganizationId?: () => string | null,
  onUnauthorized?: () => void
) {
  const client = createApiClient({
    baseUrl: SERVICES.AUTH,
    getAccessToken,
    getOrganizationId,
    onUnauthorized,
  });

  return {
    // ========================================================================
    // Authentication
    // ========================================================================

    /**
     * Login with email and password
     */
    login(data: LoginRequest): Promise<LoginResponse> {
      return client.post<LoginResponse>('/auth/login', data);
    },

    /**
     * Register new user
     */
    register(data: RegisterRequest): Promise<RegisterResponse> {
      return client.post<RegisterResponse>('/auth/register', data);
    },

    /**
     * Refresh access token
     */
    refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
      return client.post<RefreshTokenResponse>('/auth/refresh', data);
    },

    /**
     * Logout (invalidate tokens)
     */
    logout(): Promise<void> {
      return client.post<void>('/auth/logout');
    },

    /**
     * Request password reset email
     */
    requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
      return client.post<{ message: string }>('/auth/password/reset', data);
    },

    /**
     * Update password with reset token
     */
    updatePassword(data: PasswordUpdateRequest): Promise<{ message: string }> {
      return client.post<{ message: string }>('/auth/password/update', data);
    },

    // ========================================================================
    // User Profile
    // ========================================================================

    /**
     * Get current user's profile
     */
    getMyProfile(): Promise<Profile> {
      return client.get<Profile>('/users/profile/me');
    },

    /**
     * Update current user's profile
     */
    updateMyProfile(data: UpdateProfileRequest): Promise<Profile> {
      return client.patch<Profile>('/users/profile/me', data);
    },

    // ========================================================================
    // Organizations
    // ========================================================================

    /**
     * Get organizations where user is a member
     */
    getMyOrganizations(): Promise<Array<Organization & { membership: OrganizationMember }>> {
      return client.get<Array<Organization & { membership: OrganizationMember }>>('/organizations/mine');
    },

    /**
     * Create a new organization
     */
    createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
      return client.post<Organization>('/organizations', data);
    },

    /**
     * Get organization by ID
     */
    getOrganization(orgId: string): Promise<Organization> {
      return client.get<Organization>(`/organizations/${orgId}`);
    },

    /**
     * Update organization
     */
    updateOrganization(
      orgId: string,
      data: Partial<CreateOrganizationRequest>
    ): Promise<Organization> {
      return client.patch<Organization>(`/organizations/${orgId}`, data);
    },

    // ========================================================================
    // Organization Members
    // ========================================================================

    /**
     * Get members of an organization
     */
    getOrganizationMembers(orgId: string): Promise<OrganizationMemberWithProfile[]> {
      return client.get<OrganizationMemberWithProfile[]>(`/organizations/${orgId}/members`);
    },

    /**
     * Invite a user to organization
     */
    inviteMember(orgId: string, data: InviteMemberPayload): Promise<OrganizationMember> {
      return client.post<OrganizationMember>(`/organizations/${orgId}/members`, data);
    },

    /**
     * Update member role
     */
    updateMemberRole(
      orgId: string,
      memberId: string,
      data: UpdateMemberRoleRequest
    ): Promise<OrganizationMember> {
      return client.patch<OrganizationMember>(
        `/organizations/${orgId}/members/${memberId}`,
        data
      );
    },

    /**
     * Remove member from organization
     */
    removeMember(orgId: string, memberId: string): Promise<void> {
      return client.delete<void>(`/organizations/${orgId}/members/${memberId}`);
    },

    /**
     * Suspend member
     */
    suspendMember(orgId: string, memberId: string): Promise<OrganizationMember> {
      return client.patch<OrganizationMember>(
        `/organizations/${orgId}/members/${memberId}`,
        { status: 'suspended' }
      );
    },

    /**
     * Reactivate suspended member
     */
    reactivateMember(orgId: string, memberId: string): Promise<OrganizationMember> {
      return client.patch<OrganizationMember>(
        `/organizations/${orgId}/members/${memberId}`,
        { status: 'active' }
      );
    },

    /**
     * Resend invitation email
     */
    resendInvitation(orgId: string, memberId: string): Promise<{ message: string }> {
      return client.post<{ message: string }>(
        `/organizations/${orgId}/members/${memberId}/resend-invite`
      );
    },

    // ========================================================================
    // Utility
    // ========================================================================

    /**
     * Get raw client for custom requests
     */
    getClient(): ApiClient {
      return client;
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
