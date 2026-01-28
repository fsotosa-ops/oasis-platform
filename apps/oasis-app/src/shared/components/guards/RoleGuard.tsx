'use client';

import React from 'react';
import { useAuth, useRole } from '@/features/auth/hooks/useAuth';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  /**
   * Specific roles that are allowed
   */
  allowedRoles?: OrganizationRole[];
  /**
   * Minimum role level required
   */
  minRole?: OrganizationRole;
  /**
   * Require platform admin
   */
  requirePlatformAdmin?: boolean;
  /**
   * Content to show when user doesn't have access
   */
  fallback?: React.ReactNode;
  /**
   * Show loading spinner while checking
   */
  showLoading?: boolean;
}

/**
 * Client-side role guard for conditional rendering
 */
export function RoleGuard({
  children,
  allowedRoles,
  minRole,
  requirePlatformAdmin = false,
  fallback = null,
  showLoading = false,
}: RoleGuardProps) {
  const { currentOrg, isLoading, profile } = useAuth();
  const { role, isPlatformAdmin } = useRole();

  // Show loading state
  if (isLoading) {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      );
    }
    return null;
  }

  // Check platform admin requirement
  if (requirePlatformAdmin) {
    if (!isPlatformAdmin) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Check if user has an organization context
  if (!currentOrg || !role) {
    return <>{fallback}</>;
  }

  // Check specific roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Check minimum role
  if (minRole && !hasPermission(role, minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface OrgGuardProps {
  children: React.ReactNode;
  /**
   * Require user to have an organization
   */
  requireOrg?: boolean;
  /**
   * Content to show when user has no organization
   */
  fallback?: React.ReactNode;
}

/**
 * Guard that checks if user has an organization context
 */
export function OrgGuard({
  children,
  requireOrg = true,
  fallback = null,
}: OrgGuardProps) {
  const { currentOrg, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (requireOrg && !currentOrg) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Content to show when user is not authenticated
   */
  fallback?: React.ReactNode;
}

/**
 * Simple auth guard for checking authentication status
 */
export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for conditional rendering based on permissions
 */
export function useCanAccess(options: {
  allowedRoles?: OrganizationRole[];
  minRole?: OrganizationRole;
  requirePlatformAdmin?: boolean;
}): boolean {
  const { currentOrg } = useAuth();
  const { role, isPlatformAdmin } = useRole();

  if (options.requirePlatformAdmin) {
    return isPlatformAdmin;
  }

  if (!currentOrg || !role) {
    return false;
  }

  if (options.allowedRoles && !options.allowedRoles.includes(role)) {
    return false;
  }

  if (options.minRole && !hasPermission(role, options.minRole)) {
    return false;
  }

  return true;
}
