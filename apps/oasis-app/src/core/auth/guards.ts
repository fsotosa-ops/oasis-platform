/**
 * Server-side route guards
 */

import { redirect } from 'next/navigation';
import { getServerAuthContext, getServerRole, isPlatformAdmin } from './session';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(redirectTo = '/login') {
  const { isAuthenticated } = await getServerAuthContext();

  if (!isAuthenticated) {
    redirect(redirectTo);
  }
}

/**
 * Require specific roles - redirects to dashboard if unauthorized
 */
export async function requireRole(
  allowedRoles: OrganizationRole[],
  redirectTo = '/'
) {
  const role = await getServerRole();

  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo);
  }
}

/**
 * Require minimum role level
 */
export async function requireMinRole(
  minRole: OrganizationRole,
  redirectTo = '/'
) {
  const role = await getServerRole();

  if (!role || !hasPermission(role, minRole)) {
    redirect(redirectTo);
  }
}

/**
 * Require platform admin - redirects if not platform admin
 */
export async function requirePlatformAdmin(redirectTo = '/') {
  const isAdmin = await isPlatformAdmin();

  if (!isAdmin) {
    redirect(redirectTo);
  }
}

/**
 * Require auth and return context - for pages that need user data
 */
export async function requireAuthWithContext() {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated) {
    redirect('/login');
  }

  return context;
}

/**
 * Redirect authenticated users (e.g., from login page)
 */
export async function redirectIfAuthenticated(redirectTo = '/') {
  const { isAuthenticated } = await getServerAuthContext();

  if (isAuthenticated) {
    redirect(redirectTo);
  }
}

/**
 * Guard for admin routes
 */
export async function adminGuard() {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated) {
    redirect('/login');
  }

  if (!context.role || !hasPermission(context.role, 'facilitador')) {
    redirect('/');
  }

  return context;
}

/**
 * Guard for backoffice routes
 */
export async function backofficeGuard() {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated) {
    redirect('/login');
  }

  if (!context.isPlatformAdmin) {
    redirect('/');
  }

  return context;
}

/**
 * Guard for settings/team routes
 */
export async function teamManagementGuard() {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated) {
    redirect('/login');
  }

  if (!context.role || !hasPermission(context.role, 'admin')) {
    redirect('/settings');
  }

  return context;
}

/**
 * Guard for organization owner routes
 */
export async function ownerGuard() {
  const context = await getServerAuthContext();

  if (!context.isAuthenticated) {
    redirect('/login');
  }

  if (context.role !== 'owner') {
    redirect('/settings');
  }

  return context;
}
