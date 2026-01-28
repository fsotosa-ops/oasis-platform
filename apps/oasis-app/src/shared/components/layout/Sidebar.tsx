'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useAuth, useRole } from '@/features/auth/hooks/useAuth';
import { OrgSwitcher } from '@/features/organization/components/OrgSwitcher';
import {
  MAIN_NAV,
  ADMIN_NAV,
  SETTINGS_NAV,
  BACKOFFICE_NAV,
  type NavItem,
} from '@/core/config/routes';
import { hasPermission } from '@/core/config/permissions';
import { getInitials } from '@/shared/lib/formatters';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut, myOrganizations } = useAuth();
  const { role, isPlatformAdmin } = useRole();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Filter nav items based on role
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      // Platform admin check
      if (item.isPlatformAdminOnly && !isPlatformAdmin) {
        return false;
      }

      // Role check
      if (item.roles && role && !item.roles.includes(role)) {
        return false;
      }

      // Min role check
      if (item.minRole && role && !hasPermission(role, item.minRole)) {
        return false;
      }

      return true;
    }).map((item) => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    }));
  };

  const mainNavFiltered = filterNavItems(MAIN_NAV);
  const adminNavFiltered = filterNavItems(ADMIN_NAV);
  const settingsNavFiltered = filterNavItems(SETTINGS_NAV);
  const backofficeNavFiltered = filterNavItems(BACKOFFICE_NAV);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--neon-fuchsia)] to-[var(--neon-yellow)] bg-clip-text text-transparent">
              OASIS
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleCollapse}
          className="hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Org Switcher */}
      {!isCollapsed && myOrganizations.length > 0 && (
        <div className="border-b p-4">
          <OrgSwitcher />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-6 px-2">
          {/* Main Navigation */}
          <NavSection
            items={mainNavFiltered}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />

          {/* Admin Navigation */}
          {adminNavFiltered.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Gestión
                </div>
              )}
              <NavSection
                items={adminNavFiltered}
                pathname={pathname}
                isCollapsed={isCollapsed}
              />
            </>
          )}

          {/* Settings */}
          <NavSection
            items={settingsNavFiltered}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />

          {/* Backoffice */}
          {backofficeNavFiltered.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Platform
                </div>
              )}
              <NavSection
                items={backofficeNavFiltered}
                pathname={pathname}
                isCollapsed={isCollapsed}
              />
            </>
          )}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t p-4">
        {profile && (
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {getInitials(profile.full_name || profile.email)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={signOut}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-sidebar h-screen sticky top-0 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

interface NavSectionProps {
  items: NavItem[];
  pathname: string;
  isCollapsed: boolean;
}

function NavSection({ items, pathname, isCollapsed }: NavSectionProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <NavItemComponent
          key={item.href}
          item={item}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />
      ))}
    </ul>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  depth?: number;
}

function NavItemComponent({
  item,
  pathname,
  isCollapsed,
  depth = 0,
}: NavItemComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.children?.some(
      child => pathname === child.href || pathname.startsWith(child.href + '/')
    )) {
      setIsOpen(true);
    }
  }, [pathname, hasChildren, item.children]);

  if (hasChildren && !isCollapsed) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1 pl-4">
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.href}
                item={child}
                pathname={pathname}
                isCollapsed={isCollapsed}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
}
