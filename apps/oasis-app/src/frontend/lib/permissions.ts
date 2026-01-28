import { OrganizationRole } from '@/frontend/types/auth.types';

const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  owner: 4,
  admin: 3,
  facilitador: 2,
  participante: 1,
};

export const PERMISSIONS = {
  canManageTeam: ['owner', 'admin'] as OrganizationRole[],
  canEditContent: ['owner', 'admin', 'facilitador'] as OrganizationRole[],
  canDeleteOrg: ['owner'] as OrganizationRole[],
  canViewAnalytics: ['owner', 'admin', 'facilitador'] as OrganizationRole[],
};

export function hasPermission(
  currentRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

export function hasFeature(
  orgSettings: Record<string, any>,
  featureKey: string
): boolean {
  return orgSettings?.features?.includes(featureKey) ?? false;
}