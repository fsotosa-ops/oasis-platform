'use client';

import React, { useState } from 'react';
import { useAuth, useRole } from '@/features/auth/hooks/useAuth';
import { useMembers } from '@/features/organization/hooks/useMembers';
import { MemberList } from '@/features/organization/components/MemberList';
import { InviteMemberModal } from '@/features/organization/components/InviteMemberModal';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Input } from '@/shared/components/ui/input';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function TeamManager() {
  const { profile, currentOrg } = useAuth();
  const { role, isAdmin } = useRole();
  const {
    members,
    isLoading,
    error,
    refresh,
    inviteMember,
    updateMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
    resendInvitation,
  } = useMembers();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleInvite = async (email: string, inviteRole: string) => {
    setActionError(null);
    try {
      await inviteMember(email, inviteRole as any);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al invitar');
      throw err;
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error en la operación');
    }
  };

  // Filter members by search
  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.profile.email.toLowerCase().includes(query) ||
      (member.profile.full_name?.toLowerCase() || '').includes(query)
    );
  });

  // Stats
  const activeCount = members.filter((m) => m.status === 'active').length;
  const invitedCount = members.filter((m) => m.status === 'invited').length;
  const suspendedCount = members.filter((m) => m.status === 'suspended').length;

  if (!currentOrg || !profile) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Equipo
              </CardTitle>
              <CardDescription>
                Gestiona los miembros de {currentOrg.data.name}
              </CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Invitar Miembro</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Activos:</span>
              <span className="font-medium">{activeCount}</span>
            </div>
            {invitedCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Pendientes:</span>
                <span className="font-medium">{invitedCount}</span>
              </div>
            )}
            {suspendedCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Suspendidos:</span>
                <span className="font-medium">{suspendedCount}</span>
              </div>
            )}
          </div>

          {/* Search and refresh */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {(error || actionError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || actionError}</AlertDescription>
        </Alert>
      )}

      {/* Members list */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardContent className="pt-6">
          <MemberList
            members={filteredMembers}
            currentUserId={profile.id}
            currentUserRole={role || 'participante'}
            onUpdateRole={(memberId, newRole) =>
              handleAction(() => updateMemberRole(memberId, newRole))
            }
            onRemoveMember={(memberId) =>
              handleAction(() => removeMember(memberId))
            }
            onSuspendMember={(memberId) =>
              handleAction(() => suspendMember(memberId))
            }
            onReactivateMember={(memberId) =>
              handleAction(() => reactivateMember(memberId))
            }
            onResendInvitation={(memberId) =>
              handleAction(() => resendInvitation(memberId))
            }
            isLoading={isLoading}
          />

          {!isLoading && filteredMembers.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron miembros que coincidan con "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {role && (
        <InviteMemberModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          onInvite={handleInvite}
          currentUserRole={role}
        />
      )}
    </div>
  );
}
