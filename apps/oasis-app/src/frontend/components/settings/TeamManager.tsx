'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/frontend/context/UserProvider';
import { createClient } from '@/backend/supabase/client';
import { RoleGuard } from '@/frontend/components/auth/RoleGuard';
import { hasPermission } from '@/frontend/lib/permissions';
import { OrganizationRole } from '@/frontend/types/auth.types';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/frontend/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/frontend/components/ui/dropdown-menu';
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Shield,
  UserMinus,
  UserX,
  Loader2,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  role: OrganizationRole;
  status: string;
  joined_at: string;
  invited_at: string | null;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function TeamManager() {
  const { currentOrg, profile } = useAuth();
  const supabase = createClient();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite dialog state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('participante');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const myRole = currentOrg?.myMembership.role;
  const canManageTeam = myRole && hasPermission(myRole, 'admin');

  const fetchMembers = useCallback(async () => {
    if (!currentOrg) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at,
          invited_at,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', currentOrg.data.id)
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Handle the profile being returned as an array or object
      const formattedMembers = (data || []).map((member: any) => ({
        ...member,
        profile: Array.isArray(member.profile) ? member.profile[0] : member.profile
      }));

      setMembers(formattedMembers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los miembros');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async () => {
    if (!currentOrg || !profile || !inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);

    try {
      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail.trim().toLowerCase())
        .single();

      if (!existingProfile) {
        throw new Error('No existe un usuario con ese correo. El usuario debe registrarse primero.');
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id, status')
        .eq('organization_id', currentOrg.data.id)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingMember) {
        if (existingMember.status === 'active') {
          throw new Error('Este usuario ya es miembro de la organización.');
        } else if (existingMember.status === 'invited') {
          throw new Error('Este usuario ya tiene una invitación pendiente.');
        }
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: currentOrg.data.id,
          user_id: existingProfile.id,
          role: inviteRole,
          status: 'invited',
          invited_by: profile.id,
          invited_at: new Date().toISOString()
        });

      if (inviteError) throw inviteError;

      setInviteEmail('');
      setInviteRole('participante');
      setIsInviteOpen(false);
      fetchMembers();
    } catch (err: any) {
      setInviteError(err.message || 'Error al enviar la invitación');
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: OrganizationRole) => {
    setActionLoading(memberId);

    try {
      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (updateError) throw updateError;

      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el rol');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (memberId: string) => {
    setActionLoading(memberId);

    try {
      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ status: 'suspended' })
        .eq('id', memberId);

      if (updateError) throw updateError;

      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error al suspender el miembro');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (memberId: string) => {
    setActionLoading(memberId);

    try {
      const { error: updateError } = await supabase
        .from('organization_members')
        .update({ status: 'active', joined_at: new Date().toISOString() })
        .eq('id', memberId);

      if (updateError) throw updateError;

      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error al reactivar el miembro');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('¿Estás seguro de eliminar a este miembro? Esta acción no se puede deshacer.')) {
      return;
    }

    setActionLoading(memberId);

    try {
      const { error: deleteError } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (deleteError) throw deleteError;

      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el miembro');
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role: OrganizationRole) => {
    const config: Record<OrganizationRole, { bg: string; label: string }> = {
      owner: { bg: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Propietario' },
      admin: { bg: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Admin' },
      facilitador: { bg: 'bg-green-100 text-green-700 border-green-200', label: 'Facilitador' },
      participante: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Participante' }
    };
    return config[role];
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
      active: { bg: 'bg-green-50 text-green-700', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Activo' },
      invited: { bg: 'bg-amber-50 text-amber-700', icon: <Clock className="h-3 w-3" />, label: 'Invitado' },
      suspended: { bg: 'bg-red-50 text-red-700', icon: <AlertCircle className="h-3 w-3" />, label: 'Suspendido' },
      inactive: { bg: 'bg-gray-50 text-gray-500', icon: <UserX className="h-3 w-3" />, label: 'Inactivo' }
    };
    return config[status] || config.inactive;
  };

  const canModifyMember = (member: TeamMember) => {
    if (!myRole || !canManageTeam) return false;
    if (member.user_id === profile?.id) return false; // Can't modify self
    if (member.role === 'owner' && myRole !== 'owner') return false; // Only owner can modify owner
    return hasPermission(myRole, member.role);
  };

  if (!currentOrg) return null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              Equipo de {currentOrg.data.name}
            </CardTitle>
            <CardDescription>
              {members.filter(m => m.status === 'active').length} miembros activos
              {members.filter(m => m.status === 'invited').length > 0 &&
                ` · ${members.filter(m => m.status === 'invited').length} invitaciones pendientes`
              }
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMembers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <RoleGuard minRole="admin">
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invitar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invitar Nuevo Miembro</DialogTitle>
                    <DialogDescription>
                      Envía una invitación a un usuario registrado para unirse a {currentOrg.data.name}.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="usuario@ejemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Rol</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrganizationRole)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="participante">Participante</SelectItem>
                          <SelectItem value="facilitador">Facilitador</SelectItem>
                          {myRole === 'owner' && (
                            <SelectItem value="admin">Administrador</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {inviteRole === 'participante' && 'Acceso básico a la plataforma'}
                        {inviteRole === 'facilitador' && 'Puede crear y gestionar contenido'}
                        {inviteRole === 'admin' && 'Gestión completa del equipo y configuración'}
                      </p>
                    </div>

                    {inviteError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {inviteError}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleInvite}
                      disabled={isInviting || !inviteEmail.trim()}
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-600"
                    >
                      {isInviting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar Invitación'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </RoleGuard>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay miembros en esta organización</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-[300px]">Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Desde</TableHead>
                    {canManageTeam && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const roleBadge = getRoleBadge(member.role);
                    const statusBadge = getStatusBadge(member.status);
                    const isCurrentUser = member.user_id === profile?.id;
                    const isActionLoading = actionLoading === member.id;

                    return (
                      <TableRow key={member.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={member.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 text-sm">
                                {getInitials(member.profile?.full_name || null, member.profile?.email || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.profile?.full_name || 'Sin nombre'}
                                {isCurrentUser && (
                                  <span className="text-xs text-gray-400 ml-2">(Tú)</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">{member.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {canModifyMember(member) && !isActionLoading ? (
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleChangeRole(member.id, value as OrganizationRole)}
                            >
                              <SelectTrigger className={`w-[130px] h-7 text-xs ${roleBadge.bg} border-0`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="participante">Participante</SelectItem>
                                <SelectItem value="facilitador">Facilitador</SelectItem>
                                {myRole === 'owner' && (
                                  <>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="owner">Propietario</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={roleBadge.bg}>{roleBadge.label}</Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={`${statusBadge.bg} gap-1`}>
                            {statusBadge.icon}
                            {statusBadge.label}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-gray-500">
                          {member.status === 'invited' && member.invited_at
                            ? `Invitado ${new Date(member.invited_at).toLocaleDateString('es-ES')}`
                            : member.joined_at
                              ? new Date(member.joined_at).toLocaleDateString('es-ES')
                              : '-'
                          }
                        </TableCell>

                        {canManageTeam && (
                          <TableCell className="text-right">
                            {canModifyMember(member) ? (
                              isActionLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {member.status === 'suspended' ? (
                                      <DropdownMenuItem onClick={() => handleReactivate(member.id)}>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Reactivar
                                      </DropdownMenuItem>
                                    ) : member.status === 'active' ? (
                                      <DropdownMenuItem onClick={() => handleSuspend(member.id)}>
                                        <UserMinus className="h-4 w-4 mr-2" />
                                        Suspender
                                      </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRemove(member.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info Card */}
      <RoleGuard allowedRoles={['participante', 'facilitador']}>
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Permisos limitados</p>
                <p className="text-sm text-blue-700">
                  Solo los administradores y propietarios pueden gestionar miembros del equipo.
                  Contacta a un administrador si necesitas hacer cambios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
}
