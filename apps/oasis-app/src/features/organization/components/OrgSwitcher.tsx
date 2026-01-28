'use client';

import React from 'react';
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useCurrentOrganization } from '@/features/auth/hooks/useAuth';
import { getInitials } from '@/shared/lib/formatters';
import { getRoleDisplayName, getRoleBadgeColor } from '@/core/config/permissions';

interface OrgSwitcherProps {
  className?: string;
  showRole?: boolean;
}

export function OrgSwitcher({ className, showRole = true }: OrgSwitcherProps) {
  const { currentOrg, myOrganizations, switchOrganization, isLoading } =
    useCurrentOrganization();

  if (isLoading) {
    return (
      <div className={cn("h-10 w-full animate-pulse bg-muted rounded-md", className)} />
    );
  }

  if (!currentOrg || myOrganizations.length === 0) {
    return null;
  }

  const currentRole = myOrganizations.find(
    (o) => o.org.id === currentOrg.data.id
  )?.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between gap-2 px-3",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentOrg.data.logo_url || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(currentOrg.data.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="truncate text-sm font-medium">
                {currentOrg.data.name}
              </span>
              {showRole && currentRole && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-sm",
                  getRoleBadgeColor(currentRole)
                )}>
                  {getRoleDisplayName(currentRole)}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuLabel>Mis Organizaciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {myOrganizations.map(({ org, role }) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrganization(org.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-6 w-6">
                <AvatarImage src={org.logo_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm">{org.name}</span>
                <span className="text-xs text-muted-foreground">
                  {getRoleDisplayName(role)}
                </span>
              </div>
            </div>
            {org.id === currentOrg.data.id && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact version for headers
 */
export function OrgSwitcherCompact({ className }: { className?: string }) {
  const { currentOrg, myOrganizations, switchOrganization, isLoading } =
    useCurrentOrganization();

  if (isLoading || !currentOrg || myOrganizations.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{currentOrg.data.name}</span>
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {myOrganizations.map(({ org }) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrganization(org.id)}
            className="cursor-pointer"
          >
            <span className="flex-1">{org.name}</span>
            {org.id === currentOrg.data.id && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
