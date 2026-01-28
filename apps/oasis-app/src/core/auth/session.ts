/**
 * Server-side session utilities
 */

import { cookies } from 'next/headers';
import { createClient } from '@/backend/supabase/server';
import type { Profile, OrganizationMember, Organization, OrganizationRole } from '@/core/types';

const ORG_COOKIE_NAME = 'oasis_current_org';

/**
 * Get current session on the server
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get user profile on the server
 */
export async function getServerProfile(): Promise<Profile | null> {
  const user = await getSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Get current organization from cookie
 */
export async function getCurrentOrgId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ORG_COOKIE_NAME)?.value || null;
}

/**
 * Get current organization and membership on the server
 */
export async function getServerOrganization(): Promise<{
  organization: Organization;
  membership: OrganizationMember;
} | null> {
  const user = await getSession();
  if (!user) return null;

  const orgId = await getCurrentOrgId();
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      status,
      invited_by,
      joined_at,
      organization:organizations (
        id,
        name,
        slug,
        description,
        logo_url,
        type,
        settings,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');

  // If we have a saved org ID, try to get that one
  if (orgId) {
    query = query.eq('organization_id', orgId);
  }

  const { data, error } = await query.limit(1).single();

  if (error || !data) {
    // If specific org not found, try to get any org
    if (orgId) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          status,
          invited_by,
          joined_at,
          organization:organizations (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (fallbackError || !fallbackData) return null;

      const org = Array.isArray(fallbackData.organization)
        ? fallbackData.organization[0]
        : fallbackData.organization;

      if (!org) return null;

      return {
        organization: org as Organization,
        membership: {
          id: fallbackData.id,
          organization_id: fallbackData.organization_id,
          user_id: fallbackData.user_id,
          role: fallbackData.role,
          status: fallbackData.status,
          invited_by: fallbackData.invited_by,
          joined_at: fallbackData.joined_at,
        } as OrganizationMember,
      };
    }
    return null;
  }

  const org = Array.isArray(data.organization)
    ? data.organization[0]
    : data.organization;

  if (!org) return null;

  return {
    organization: org as Organization,
    membership: {
      id: data.id,
      organization_id: data.organization_id,
      user_id: data.user_id,
      role: data.role,
      status: data.status,
      invited_by: data.invited_by,
      joined_at: data.joined_at,
    } as OrganizationMember,
  };
}

/**
 * Get user's role in current organization
 */
export async function getServerRole(): Promise<OrganizationRole | null> {
  const orgData = await getServerOrganization();
  return orgData?.membership.role || null;
}

/**
 * Check if user is platform admin
 */
export async function isPlatformAdmin(): Promise<boolean> {
  const profile = await getServerProfile();
  return profile?.is_platform_admin || false;
}

/**
 * Full server auth context
 */
export async function getServerAuthContext() {
  const [profile, orgData] = await Promise.all([
    getServerProfile(),
    getServerOrganization(),
  ]);

  return {
    profile,
    organization: orgData?.organization || null,
    membership: orgData?.membership || null,
    role: orgData?.membership.role || null,
    isPlatformAdmin: profile?.is_platform_admin || false,
    isAuthenticated: !!profile,
  };
}
