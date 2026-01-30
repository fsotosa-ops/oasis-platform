'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMembers } from '@/features/organization/hooks/useMembers'; 
import { MemberList } from '@/features/organization/components/MemberList';
import { InviteMemberModal } from '@/features/organization/components/InviteMemberModal';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { toast } from 'sonner'; 

export function TeamManager() {
  const { profile, currentOrg } = useAuth();
  
  // Obtenemos el rol. Si es null/undefined, el componente MemberList necesita un string válido.
  const currentUserRole = currentOrg?.myMembership?.role; 
  const isAdmin = ['owner', 'admin'].includes(currentUserRole || '');

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

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const name = member.profile?.full_name?.toLowerCase() || '';
      const email = member.profile?.email?.toLowerCase() || ''; 
      return name.includes(query) || email.includes(query);
    });
  }, [members, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success('Lista actualizada');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAction = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
      toast.success('Operación exitosa');
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Error en la operación');
      toast.error('Error en la operación');
    }
  };

  const handleInvite = async (email: string, role: string) => {
    await handleAction(async () => {
      await inviteMember(email, role as any);
      setInviteModalOpen(false);
    });
  };

  if (isLoading && !members) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipo</h2>
          <p className="text-muted-foreground">
            Gestiona los miembros de {currentOrg?.data?.name || 'tu organización'}
          </p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invitar Miembro
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Actualizar lista"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error Displays */}
      {(error || actionError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {actionError || error || 'Ocurrió un error al cargar los miembros.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Members list Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardContent className="pt-6">
          <MemberList
            members={filteredMembers}
            currentUserId={profile?.id || ''}
            // FIX: Usamos 'participante' (según la sugerencia de TS) y casteamos 'as any' 
            // para evitar bloqueos si el tipo cambia en el futuro.
            currentUserRole={(currentUserRole || 'participante') as any}
            onUpdateRole={(memberId, newRole) =>
              handleAction(() => updateMemberRole(memberId, newRole as any))
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

          {!isLoading && filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery 
                ? `No se encontraron miembros para "${searchQuery}"`
                : "No hay miembros en este equipo aún."}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <InviteMemberModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          onInvite={handleInvite}
          currentUserRole={currentUserRole as any}
        />
      )}
    </div>
  );
}