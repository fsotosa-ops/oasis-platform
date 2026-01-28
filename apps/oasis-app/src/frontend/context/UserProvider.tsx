'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import {
  CurrentUserContext,
  Profile,
  OrganizationMember,
  Organization,
  OrganizationRole
} from '@/frontend/types/auth.types';

// Tipo para la respuesta del join de Supabase (organization puede venir como objeto o array)
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

const AuthContext = createContext<CurrentUserContext>({
  profile: null,
  currentOrg: null,
  myOrganizations: [],
  isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Omit<CurrentUserContext, 'isLoading'>>({
    profile: null,
    currentOrg: null,
    myOrganizations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        setIsLoading(false);
        return;
      }

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        setIsLoading(false);
        return;
      }

      // Obtener membresías con organizaciones
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

      // Mapear las organizaciones del usuario
      const members = (membersData || []) as MemberWithOrgRaw[];

      // Helper para extraer organization (puede venir como objeto o array)
      const getOrg = (org: Organization | Organization[]): Organization | null => {
        if (Array.isArray(org)) return org[0] || null;
        return org;
      };

      const myOrgs = members
        .map((item) => {
          const org = getOrg(item.organization);
          if (!org) return null;
          return {
            org,
            role: item.role,
            membershipId: item.id
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Determinar organización actual (primera por defecto)
      const defaultMember = members.length > 0 ? members[0] : null;
      const defaultOrg = defaultMember ? getOrg(defaultMember.organization) : null;

      const currentOrgData = (defaultMember && defaultOrg) ? {
        data: defaultOrg,
        myMembership: {
          id: defaultMember.id,
          organization_id: defaultMember.organization_id,
          user_id: defaultMember.user_id,
          role: defaultMember.role,
          status: defaultMember.status,
          invited_by: defaultMember.invited_by,
          joined_at: defaultMember.joined_at
        } as OrganizationMember
      } : null;

      setState({
        profile: profile as Profile,
        myOrganizations: myOrgs,
        currentOrg: currentOrgData
      });

    } catch (error) {
      console.error('Auth context error:', error);
      setState({ profile: null, currentOrg: null, myOrganizations: [] });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUserData();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData();
      } else {
        setState({ profile: null, currentOrg: null, myOrganizations: [] });
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, supabase.auth]);

  return (
    <AuthContext.Provider value={{ ...state, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);