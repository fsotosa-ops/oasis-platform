'use client';

import React from 'react';
import { useAuth } from '@/frontend/context/UserProvider';
import { OrganizationRole } from '@/frontend/types/auth.types';
import { hasPermission } from '@/frontend/lib/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: OrganizationRole[];
  minRole?: OrganizationRole;
  fallback?: React.ReactNode;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  minRole, 
  fallback = null 
}: RoleGuardProps) => {
  const { currentOrg, isLoading } = useAuth();

  if (isLoading) return null; 

  if (!currentOrg) {
    return fallback;
  }

  const myRole = currentOrg.myMembership.role;

  if (allowedRoles && !allowedRoles.includes(myRole)) {
    return fallback;
  }

  if (minRole && !hasPermission(myRole, minRole)) {
    return fallback;
  }

  return <>{children}</>;
};