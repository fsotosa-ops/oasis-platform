/**
 * Role-based access control (RBAC) configuration
 */

import type { OrganizationRole } from '@/core/types';

/**
 * Role hierarchy - higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  owner: 4,
  admin: 3,
  facilitador: 2,
  participante: 1,
};

/**
 * Permission keys for specific actions
 */
export const PERMISSIONS = {
  // Team management
  canManageTeam: ['owner', 'admin'] as OrganizationRole[],
  canInviteMembers: ['owner', 'admin'] as OrganizationRole[],
  canChangeRoles: ['owner', 'admin'] as OrganizationRole[],
  canRemoveMembers: ['owner', 'admin'] as OrganizationRole[],

  // Content management
  canEditContent: ['owner', 'admin', 'facilitador'] as OrganizationRole[],
  canCreateJourneys: ['owner', 'admin', 'facilitador'] as OrganizationRole[],
  canDeleteJourneys: ['owner', 'admin'] as OrganizationRole[],
  canPublishJourneys: ['owner', 'admin'] as OrganizationRole[],

  // Organization
  canDeleteOrg: ['owner'] as OrganizationRole[],
  canEditOrgSettings: ['owner', 'admin'] as OrganizationRole[],

  // Analytics
  canViewAnalytics: ['owner', 'admin', 'facilitador'] as OrganizationRole[],
  canExportData: ['owner', 'admin'] as OrganizationRole[],

  // Backoffice (platform admin only)
  canAccessBackoffice: [] as OrganizationRole[], // Requires is_platform_admin
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Check if a role has at least the required permission level
 */
export function hasPermission(
  currentRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a role can perform a specific action
 */
export function canPerform(
  currentRole: OrganizationRole,
  permission: PermissionKey
): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(currentRole);
}

/**
 * Check if user has any of the allowed roles
 */
export function hasAnyRole(
  currentRole: OrganizationRole,
  allowedRoles: OrganizationRole[]
): boolean {
  return allowedRoles.includes(currentRole);
}

/**
 * Check if organization has a feature enabled
 */
export function hasFeature(
  orgSettings: Record<string, unknown>,
  featureKey: string
): boolean {
  const features = orgSettings?.features;
  if (Array.isArray(features)) {
    return features.includes(featureKey);
  }
  return false;
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: OrganizationRole): string {
  const names: Record<OrganizationRole, string> = {
    owner: 'Propietario',
    admin: 'Administrador',
    facilitador: 'Facilitador',
    participante: 'Participante',
  };
  return names[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: OrganizationRole): string {
  const colors: Record<OrganizationRole, string> = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    facilitador: 'bg-green-100 text-green-800',
    participante: 'bg-gray-100 text-gray-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}

/**
 * Get all roles in hierarchy order (highest first)
 */
export function getAllRoles(): OrganizationRole[] {
  return ['owner', 'admin', 'facilitador', 'participante'];
}

/**
 * Get roles that can be assigned by a given role
 */
export function getAssignableRoles(assignerRole: OrganizationRole): OrganizationRole[] {
  const assignerLevel = ROLE_HIERARCHY[assignerRole];
  return getAllRoles().filter(role => ROLE_HIERARCHY[role] < assignerLevel);
}
