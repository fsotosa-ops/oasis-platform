'use client';

import { useMemo } from 'react';
import { useCurrentOrganization, useRole } from './useAuth';
import { hasPermission, canPerform, type PermissionKey } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

/**
 * Hook for organization-related operations and permissions
 */
export function useOrganization() {
  const { currentOrg, myOrganizations, switchOrganization, isLoading } =
    useCurrentOrganization();
  const { role, isPlatformAdmin } = useRole();

  const organizationHelpers = useMemo(() => {
    if (!currentOrg || !role) {
      return {
        canManageTeam: false,
        canEditContent: false,
        canDeleteOrg: false,
        canViewAnalytics: false,
        checkPermission: () => false,
        checkMinRole: () => false,
      };
    }

    return {
      canManageTeam: canPerform(role, 'canManageTeam'),
      canEditContent: canPerform(role, 'canEditContent'),
      canDeleteOrg: canPerform(role, 'canDeleteOrg'),
      canViewAnalytics: canPerform(role, 'canViewAnalytics'),

      /**
       * Check if user can perform a specific action
       */
      checkPermission: (permission: PermissionKey): boolean => {
        return canPerform(role, permission);
      },

      /**
       * Check if user has at least the minimum required role
       */
      checkMinRole: (minRole: OrganizationRole): boolean => {
        return hasPermission(role, minRole);
      },
    };
  }, [currentOrg, role]);

  return {
    // Current organization data
    organization: currentOrg?.data || null,
    membership: currentOrg?.myMembership || null,

    // All user's organizations
    organizations: myOrganizations,

    // Current role
    role,
    isPlatformAdmin,

    // Actions
    switchOrganization,

    // Loading state
    isLoading,

    // Permission helpers
    ...organizationHelpers,
  };
}

/**
 * Hook for organization features
 */
export function useOrganizationFeatures() {
  const { organization } = useOrganization();

  return useMemo(() => {
    const settings = organization?.settings || {};
    const features = (settings.features as string[]) || [];

    return {
      hasFeature: (featureKey: string): boolean => features.includes(featureKey),
      features,
      settings,
    };
  }, [organization]);
}
