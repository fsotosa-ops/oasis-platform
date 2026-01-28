/**
 * Core authentication and authorization types
 */

export type OrganizationType = 'community' | 'provider' | 'sponsor' | 'enterprise';

export type OrganizationRole = 'owner' | 'admin' | 'facilitador' | 'participante';

export type MembershipStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deleted';

/**
 * User profile from profiles table
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_platform_admin: boolean;
  status: AccountStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  type: OrganizationType;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

/**
 * Organization settings object
 */
export interface OrganizationSettings {
  features?: string[];
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  limits?: {
    maxMembers?: number;
    maxJourneys?: number;
  };
  [key: string]: unknown;
}

/**
 * Organization member (user-org relationship)
 */
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: MembershipStatus;
  invited_by: string | null;
  joined_at: string;
}

/**
 * Extended member with profile info
 */
export interface OrganizationMemberWithProfile extends OrganizationMember {
  profile: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>;
}

/**
 * Current organization context (org + user's membership)
 */
export interface CurrentOrganization {
  data: Organization;
  myMembership: OrganizationMember;
}

/**
 * User's organization with role info
 */
export interface UserOrganization {
  org: Organization;
  role: OrganizationRole;
  membershipId: string;
}

/**
 * Full auth context state
 */
export interface AuthContextState {
  profile: Profile | null;
  currentOrg: CurrentOrganization | null;
  myOrganizations: UserOrganization[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth context actions
 */
export interface AuthContextActions {
  switchOrganization: (orgId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Full auth context type
 */
export type AuthContext = AuthContextState & AuthContextActions;

/**
 * Invitation payload
 */
export interface InviteMemberPayload {
  email: string;
  role: OrganizationRole;
}

/**
 * Session info
 */
export interface SessionInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}
