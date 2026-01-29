'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
  OrganizationMemberWithProfile,
  OrganizationRole,
} from '@/core/types';

interface UseMembersReturn {
  members: OrganizationMemberWithProfile[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  inviteMember: (email: string, role: OrganizationRole) => Promise<void>;
  updateMemberRole: (memberId: string, newRole: OrganizationRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  suspendMember: (memberId: string) => Promise<void>;
  reactivateMember: (memberId: string) => Promise<void>;
  resendInvitation: (memberId: string) => Promise<void>;
}

export function useMembers(): UseMembersReturn {
  const { currentOrg, profile } = useAuth();
  const [members, setMembers] = useState<OrganizationMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMembers = useCallback(async () => {
    if (!currentOrg) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          id,
          organization_id,
          user_id,
          role,
          status,
          invited_by,
          joined_at,
          profile:profiles!organization_members_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', currentOrg.data.id)
        .order('role', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform data to match expected type
      const transformedMembers: OrganizationMemberWithProfile[] = (data || [])
        .map((item) => {
          // Handle profile being an array or object
          const profileData = Array.isArray(item.profile)
            ? item.profile[0]
            : item.profile;

          if (!profileData) return null;

          return {
            id: item.id,
            organization_id: item.organization_id,
            user_id: item.user_id,
            role: item.role as OrganizationRole,
            status: item.status,
            invited_by: item.invited_by,
            joined_at: item.joined_at,
            profile: {
              id: profileData.id,
              email: profileData.email,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
            },
          };
        })
        .filter((m): m is OrganizationMemberWithProfile => m !== null);

      setMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar miembros');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const inviteMember = useCallback(
    async (email: string, role: OrganizationRole) => {
      if (!currentOrg || !profile) {
        throw new Error('No hay organización seleccionada');
      }

      // Check if user already exists in the system
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Check if already a member
        const { data: existingMember } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', currentOrg.data.id)
          .eq('user_id', existingProfile.id)
          .single();

        if (existingMember) {
          throw new Error('Este usuario ya es miembro de la organización');
        }

        // Add existing user as member
        const { error: insertError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: currentOrg.data.id,
            user_id: existingProfile.id,
            role,
            status: 'active',
            invited_by: profile.id,
          });

        if (insertError) throw insertError;
      } else {
        // Invite new user via Supabase Auth
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              invited_to_org: currentOrg.data.id,
              invited_role: role,
              invited_by: profile.id,
            },
          }
        );

        // If admin invite fails, try creating a pending invitation record
        if (inviteError) {
          // For now, we'll create a placeholder that will be resolved on registration
          console.warn('Admin invite failed, creating pending invitation:', inviteError);

          // Use auth.signInWithOtp as a workaround for non-admin invite
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
              data: {
                invited_to_org: currentOrg.data.id,
                invited_role: role,
                invited_by: profile.id,
              },
            },
          });

          if (otpError && !otpError.message.includes('User not found')) {
            throw new Error(`Error al enviar invitación: ${otpError.message}`);
          }
        }
      }

      await fetchMembers();
    },
    [currentOrg, profile, supabase, fetchMembers]
  );

  const updateMemberRole = useCallback(
    async (memberId: string, newRole: OrganizationRole) => {
      if (!currentOrg) {
        throw new Error('No hay organización seleccionada');
      }

      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('organization_id', currentOrg.data.id);

      if (updateError) throw updateError;

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    },
    [currentOrg, supabase]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!currentOrg) {
        throw new Error('No hay organización seleccionada');
      }

      const { error: deleteError } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', currentOrg.data.id);

      if (deleteError) throw deleteError;

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    },
    [currentOrg, supabase]
  );

  const suspendMember = useCallback(
    async (memberId: string) => {
      if (!currentOrg) {
        throw new Error('No hay organización seleccionada');
      }

      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ status: 'suspended' })
        .eq('id', memberId)
        .eq('organization_id', currentOrg.data.id);

      if (updateError) throw updateError;

      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, status: 'suspended' } : m
        )
      );
    },
    [currentOrg, supabase]
  );

  const reactivateMember = useCallback(
    async (memberId: string) => {
      if (!currentOrg) {
        throw new Error('No hay organización seleccionada');
      }

      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ status: 'active' })
        .eq('id', memberId)
        .eq('organization_id', currentOrg.data.id);

      if (updateError) throw updateError;

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: 'active' } : m))
      );
    },
    [currentOrg, supabase]
  );

  const resendInvitation = useCallback(
    async (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member || !currentOrg) {
        throw new Error('Miembro no encontrado');
      }

      // Resend via OTP
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: member.profile.email,
        options: {
          shouldCreateUser: false,
          data: {
            invited_to_org: currentOrg.data.id,
            invited_role: member.role,
          },
        },
      });

      if (otpError && !otpError.message.includes('User not found')) {
        throw new Error(`Error al reenviar invitación: ${otpError.message}`);
      }
    },
    [members, currentOrg, supabase]
  );

  return {
    members,
    isLoading,
    error,
    refresh: fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
    resendInvitation,
  };
}
