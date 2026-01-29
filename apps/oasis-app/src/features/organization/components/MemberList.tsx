'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { RoleBadge, RoleSelect } from './RoleSelect';
import { Badge } from '@/shared/components/ui/badge';
import {
  MoreHorizontal,
  UserMinus,
  Ban,
  RefreshCw,
  Mail,
  Clock,
  Loader2,
} from 'lucide-react';
import type {
  OrganizationMemberWithProfile,
  OrganizationRole,
  MembershipStatus,
} from '@/core/types';

interface MemberListProps {
  members: OrganizationMemberWithProfile[];
  currentUserId: string;
  currentUserRole: OrganizationRole;
  onUpdateRole: (memberId: string, newRole: OrganizationRole) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onSuspendMember: (memberId: string) => Promise<void>;
  onReactivateMember: (memberId: string) => Promise<void>;
  onResendInvitation: (memberId: string) => Promise<void>;
  isLoading?: boolean;
}

interface MemberRowProps {
  member: OrganizationMemberWithProfile;
  currentUserId: string;
  currentUserRole: OrganizationRole;
  onUpdateRole: (newRole: OrganizationRole) => Promise<void>;
  onRemove: () => Promise<void>;
  onSuspend: () => Promise<void>;
  onReactivate: () => Promise<void>;
  onResendInvitation: () => Promise<void>;
}

function getStatusBadge(status: MembershipStatus) {
  switch (status) {
    case 'active':
      return null; // Don't show badge for active
    case 'invited':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />
          Pendiente
        </Badge>
      );
    case 'suspended':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <Ban className="mr-1 h-3 w-3" />
          Suspendido
        </Badge>
      );
    case 'inactive':
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          Inactivo
        </Badge>
      );
    default:
      return null;
  }
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function canManageMember(
  currentRole: OrganizationRole,
  targetRole: OrganizationRole
): boolean {
  const hierarchy: Record<OrganizationRole, number> = {
    owner: 4,
    admin: 3,
    facilitador: 2,
    participante: 1,
  };
  return hierarchy[currentRole] > hierarchy[targetRole];
}

function MemberRow({
  member,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemove,
  onSuspend,
  onReactivate,
  onResendInvitation,
}: MemberRowProps) {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'remove' | 'suspend' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isCurrentUser = member.user_id === currentUserId;
  const canManage = !isCurrentUser && canManageMember(currentUserRole, member.role);
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRoleChange = async (newRole: OrganizationRole) => {
    setIsChangingRole(true);
    try {
      await onUpdateRole(newRole);
    } finally {
      setIsChangingRole(false);
      setRoleSelectOpen(false);
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await action();
    } finally {
      setIsActionLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-4 px-4 hover:bg-muted/50 rounded-lg transition-colors">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(member.profile.full_name, member.profile.email)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {member.profile.full_name || member.profile.email}
              </span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  Tú
                </Badge>
              )}
              {getStatusBadge(member.status)}
            </div>
            <span className="text-sm text-muted-foreground">
              {member.profile.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role display or select */}
          {roleSelectOpen && canManage ? (
            <div className="w-40">
              <RoleSelect
                value={member.role}
                onChange={handleRoleChange}
                disabled={isChangingRole}
                excludeRoles={isOwner ? ['owner'] : ['owner', 'admin']}
              />
            </div>
          ) : (
            <RoleBadge role={member.role} />
          )}

          {/* Actions dropdown */}
          {canManage && isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRoleSelectOpen(!roleSelectOpen)}>
                  Cambiar rol
                </DropdownMenuItem>

                {member.status === 'invited' && (
                  <DropdownMenuItem onClick={() => handleAction(onResendInvitation)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar invitación
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {member.status === 'active' && (
                  <DropdownMenuItem
                    onClick={() => setConfirmAction('suspend')}
                    className="text-orange-600"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspender
                  </DropdownMenuItem>
                )}

                {member.status === 'suspended' && (
                  <DropdownMenuItem onClick={() => handleAction(onReactivate)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reactivar
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => setConfirmAction('remove')}
                  className="text-destructive"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Confirmation dialogs */}
      <AlertDialog open={confirmAction === 'remove'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.profile.full_name || member.profile.email} será eliminado de la
              organización. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(onRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmAction === 'suspend'}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Suspender miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              {member.profile.full_name || member.profile.email} no podrá acceder a la
              organización hasta que sea reactivado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(onSuspend)}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Suspender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemoveMember,
  onSuspendMember,
  onReactivateMember,
  onResendInvitation,
  isLoading = false,
}: MemberListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay miembros en esta organización.
      </div>
    );
  }

  // Sort: owner first, then by role, then by name
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder: Record<OrganizationRole, number> = {
      owner: 1,
      admin: 2,
      facilitador: 3,
      participante: 4,
    };
    const roleCompare = roleOrder[a.role] - roleOrder[b.role];
    if (roleCompare !== 0) return roleCompare;

    const nameA = a.profile.full_name || a.profile.email;
    const nameB = b.profile.full_name || b.profile.email;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="space-y-1">
      {sortedMembers.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onUpdateRole={(newRole) => onUpdateRole(member.id, newRole)}
          onRemove={() => onRemoveMember(member.id)}
          onSuspend={() => onSuspendMember(member.id)}
          onReactivate={() => onReactivateMember(member.id)}
          onResendInvitation={() => onResendInvitation(member.id)}
        />
      ))}
    </div>
  );
}
