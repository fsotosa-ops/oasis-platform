export type OrganizationType = 'community' | 'provider' | 'sponsor' | 'enterprise';

export type OrganizationRole = 'owner' | 'admin' | 'facilitador' | 'participante';

export type MembershipStatus = 'active' | 'invited' | 'suspended' | 'inactive';

export type AccountStatus = 'active' | 'suspended' | 'pending_verification' | 'deleted';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_platform_admin: boolean;
  status: AccountStatus;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  type: OrganizationType;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: MembershipStatus;
  invited_by: string | null;
  joined_at: string;
}

export interface CurrentUserContext {
  profile: Profile | null;
  currentOrg: {
    data: Organization;
    myMembership: OrganizationMember;
  } | null;
  myOrganizations: Array<{
    org: Organization;
    role: OrganizationRole;
    membershipId: string;
  }>;
  isLoading: boolean;
}