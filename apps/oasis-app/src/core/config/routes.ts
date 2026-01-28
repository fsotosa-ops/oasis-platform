/**
 * Route configuration with role-based access
 */

import type { OrganizationRole } from '@/core/types';
import {
  LayoutDashboard,
  Map,
  Users,
  Calendar,
  Settings,
  BarChart3,
  Building2,
  Shield,
  BookOpen,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: OrganizationRole[]; // If undefined, accessible to all authenticated users
  minRole?: OrganizationRole; // Minimum role required
  isPlatformAdminOnly?: boolean;
  children?: NavItem[];
}

export interface RouteConfig {
  path: string;
  roles?: OrganizationRole[];
  minRole?: OrganizationRole;
  isPlatformAdminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Main navigation items for sidebar
 */
export const MAIN_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Mi Viaje',
    href: '/journey',
    icon: Map,
  },
  {
    label: 'Comunidad',
    href: '/community',
    icon: Users,
  },
  {
    label: 'Eventos',
    href: '/events',
    icon: Calendar,
  },
];

/**
 * Admin navigation items (visible to admin+ roles)
 */
export const ADMIN_NAV: NavItem[] = [
  {
    label: 'Gestión',
    href: '/admin',
    icon: BarChart3,
    minRole: 'admin',
    children: [
      {
        label: 'Journeys',
        href: '/admin/journeys',
        icon: BookOpen,
        minRole: 'facilitador',
      },
      {
        label: 'Participantes',
        href: '/admin/participants',
        icon: Users,
        minRole: 'facilitador',
      },
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        minRole: 'admin',
      },
      {
        label: 'Gamificación',
        href: '/admin/gamification',
        icon: Trophy,
        minRole: 'admin',
      },
    ],
  },
];

/**
 * Settings navigation
 */
export const SETTINGS_NAV: NavItem[] = [
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
    children: [
      {
        label: 'Mi Perfil',
        href: '/settings/profile',
        icon: Users,
      },
      {
        label: 'Equipo',
        href: '/settings/team',
        icon: Users,
        minRole: 'admin',
      },
      {
        label: 'Organización',
        href: '/settings/organization',
        icon: Building2,
        roles: ['owner'],
      },
    ],
  },
];

/**
 * Backoffice navigation (platform admins only)
 */
export const BACKOFFICE_NAV: NavItem[] = [
  {
    label: 'Backoffice',
    href: '/backoffice',
    icon: Shield,
    isPlatformAdminOnly: true,
    children: [
      {
        label: 'Organizaciones',
        href: '/backoffice/organizations',
        icon: Building2,
        isPlatformAdminOnly: true,
      },
      {
        label: 'Usuarios',
        href: '/backoffice/users',
        icon: Users,
        isPlatformAdminOnly: true,
      },
      {
        label: 'Auditoría',
        href: '/backoffice/audit',
        icon: Shield,
        isPlatformAdminOnly: true,
      },
    ],
  },
];

/**
 * Route protection configuration
 */
export const PROTECTED_ROUTES: RouteConfig[] = [
  // Admin routes
  { path: '/admin', minRole: 'facilitador' },
  { path: '/admin/journeys', minRole: 'facilitador' },
  { path: '/admin/participants', minRole: 'facilitador' },
  { path: '/admin/analytics', minRole: 'admin' },
  { path: '/admin/gamification', minRole: 'admin' },

  // Settings routes
  { path: '/settings/team', minRole: 'admin' },
  { path: '/settings/organization', roles: ['owner'] },

  // Backoffice routes
  { path: '/backoffice', isPlatformAdminOnly: true },
  { path: '/backoffice/organizations', isPlatformAdminOnly: true },
  { path: '/backoffice/users', isPlatformAdminOnly: true },
  { path: '/backoffice/audit', isPlatformAdminOnly: true },
];

/**
 * Public routes (no auth required)
 */
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

/**
 * Check if a path matches a route pattern
 */
export function matchRoute(path: string, pattern: string): boolean {
  // Handle exact match
  if (path === pattern) return true;

  // Handle wildcard patterns like /admin/*
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -2);
    return path === base || path.startsWith(base + '/');
  }

  // Handle prefix match for nested routes
  return path.startsWith(pattern + '/');
}

/**
 * Find route config for a given path
 */
export function findRouteConfig(path: string): RouteConfig | undefined {
  return PROTECTED_ROUTES.find(route => matchRoute(path, route.path));
}

/**
 * Check if a route is public
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => matchRoute(path, route));
}
