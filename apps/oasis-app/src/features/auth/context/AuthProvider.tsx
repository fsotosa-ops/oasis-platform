'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { createClient } from '@/backend/supabase/client';
import type {
  Profile,
  Organization,
  OrganizationMember,
  OrganizationRole,
  AuthContext,
  AuthContextState,
  CurrentOrganization,
  UserOrganization,
} from '@/core/types';

// Cookie name for persisting current org
const ORG_COOKIE_NAME = 'oasis_current_org';

// Type for Supabase join response (organization can come as object or array)
interface MemberWithOrgRaw {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  status: string;
  invited_by: string | null;
  joined_at: string;
  organization: Organization | Organization[];
}

// Default context value
const defaultContext: AuthContext = {
  profile: null,
  currentOrg: null,
  myOrganizations: [],
  isLoading: true,
  error: null,
  switchOrganization: async () => {},
  refreshUser: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContext>(defaultContext);

// Cookie utilities
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof window === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<Omit<AuthContextState, 'isLoading' | 'error'>>({
    profile: null,
    currentOrg: null,
    myOrganizations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Helper to extract organization from Supabase join (can be object or array)
  const getOrg = useCallback((org: Organization | Organization[]): Organization | null => {
    if (Array.isArray(org)) return org[0] || null;
    return org;
  }, []);

  // Fetch user data from Supabase
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        deleteCookie(ORG_COOKIE_NAME);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        return;
      }

      // Get organization memberships with organization data
      const { data: membersData, error: membersError } = await supabase
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

      if (membersError) {
        console.error('Error fetching memberships:', membersError);
      }

      // Map organizations
      const members = (membersData || []) as MemberWithOrgRaw[];
      const myOrgs: UserOrganization[] = members
        .map((item) => {
          const org = getOrg(item.organization);
          if (!org) return null;
          return {
            org,
            role: item.role,
            membershipId: item.id,
          };
        })
        .filter((item): item is UserOrganization => item !== null);

      // Determine current organization
      let currentOrgData: CurrentOrganization | null = null;

      if (members.length > 0) {
        // Try to restore from cookie
        const savedOrgId = getCookie(ORG_COOKIE_NAME);
        let selectedMember = members[0]; // Default to first

        if (savedOrgId) {
          const found = members.find((m) => m.organization_id === savedOrgId);
          if (found) {
            selectedMember = found;
          }
        }

        const org = getOrg(selectedMember.organization);
        if (org) {
          currentOrgData = {
            data: org,
            myMembership: {
              id: selectedMember.id,
              organization_id: selectedMember.organization_id,
              user_id: selectedMember.user_id,
              role: selectedMember.role,
              status: selectedMember.status as OrganizationMember['status'],
              invited_by: selectedMember.invited_by,
              joined_at: selectedMember.joined_at,
            },
          };
          // Save to cookie
          setCookie(ORG_COOKIE_NAME, org.id);
        }
      }

      setState({
        profile: profile as Profile,
        myOrganizations: myOrgs,
        currentOrg: currentOrgData,
      });
    } catch (err) {
      console.error('Auth context error:', err);
      setError(err instanceof Error ? err.message : 'Error loading user data');
      setState({ profile: null, currentOrg: null, myOrganizations: [] });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, getOrg]);

  // Switch to a different organization
  const switchOrganization = useCallback(
    async (orgId: string) => {
      const membership = state.myOrganizations.find((m) => m.org.id === orgId);

      if (!membership) {
        console.error('Organization not found in memberships');
        return;
      }

      // Get full membership data
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('id', membership.membershipId)
        .single();

      if (memberError || !memberData) {
        console.error('Error fetching membership:', memberError);
        return;
      }

      const newCurrentOrg: CurrentOrganization = {
        data: membership.org,
        myMembership: memberData as OrganizationMember,
      };

      setState((prev) => ({
        ...prev,
        currentOrg: newCurrentOrg,
      }));

      setCookie(ORG_COOKIE_NAME, orgId);
    },
    [state.myOrganizations, supabase]
  );

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ profile: null, currentOrg: null, myOrganizations: [] });
    deleteCookie(ORG_COOKIE_NAME);
  }, [supabase.auth]);

  // Initialize on mount
  useEffect(() => {
    fetchUserData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData();
      } else {
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        deleteCookie(ORG_COOKIE_NAME);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, supabase.auth]);

  const contextValue: AuthContext = useMemo(
    () => ({
      ...state,
      isLoading,
      error,
      switchOrganization,
      refreshUser,
      signOut,
    }),
    [state, isLoading, error, switchOrganization, refreshUser, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to get current user profile
 */
export function useProfile() {
  const { profile, isLoading } = useAuth();
  return { profile, isLoading };
}

/**
 * Hook to get current organization
 */
export function useCurrentOrganization() {
  const { currentOrg, myOrganizations, switchOrganization, isLoading } = useAuth();
  return {
    currentOrg,
    myOrganizations,
    switchOrganization,
    isLoading,
  };
}

/**
 * Hook to check if user has a specific role
 */
export function useRole() {
  const { currentOrg, profile } = useAuth();

  const role = currentOrg?.myMembership.role || null;
  const isPlatformAdmin = profile?.is_platform_admin || false;

  return {
    role,
    isPlatformAdmin,
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    isFacilitador: role === 'owner' || role === 'admin' || role === 'facilitador',
    isParticipante: role === 'participante',
  };
}
