'use client';

import { useState } from 'react';
import { useAuth } from '@/frontend/context/UserProvider';
import { createClient } from '@/backend/supabase/client';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/frontend/components/ui/avatar';
import { Badge } from '@/frontend/components/ui/badge';
import { User, Mail, Shield, Calendar, Loader2, Check } from 'lucide-react';

export function ProfileForm() {
  const { profile, currentOrg } = useAuth();
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'facilitador': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      owner: 'Propietario',
      admin: 'Administrador',
      facilitador: 'Facilitador',
      participante: 'Participante'
    };
    return labels[role] || role;
  };

  if (!profile) return null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Profile Card */}
      <Card className="md:col-span-1 bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white text-2xl font-bold">
                {getInitials(profile.full_name, profile.email)}
              </AvatarFallback>
            </Avatar>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {profile.full_name || 'Sin nombre'}
            </h3>
            <p className="text-sm text-gray-500">{profile.email}</p>

            {currentOrg && (
              <Badge className={`mt-3 ${getRoleBadgeColor(currentOrg.myMembership.role)}`}>
                {getRoleLabel(currentOrg.myMembership.role)}
              </Badge>
            )}

            <div className="mt-6 w-full pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {profile.status === 'active' ? 'Activo' : profile.status}
                </Badge>
              </div>

              {profile.is_platform_admin && (
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-gray-500">Permisos</span>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Plataforma
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-gray-500">Miembro desde</span>
                <span className="text-gray-700">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="md:col-span-2 bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Actualiza tu información de perfil visible para otros miembros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400">
              El correo electrónico no se puede cambiar por seguridad.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Nombre Completo
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              className="bg-white"
            />
          </div>

          {/* Organization info */}
          {currentOrg && (
            <div className="pt-4 border-t border-gray-100">
              <Label className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                Organización Actual
              </Label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{currentOrg.data.name}</p>
                    <p className="text-sm text-gray-500">{currentOrg.data.slug}</p>
                  </div>
                  <Badge className={getRoleBadgeColor(currentOrg.myMembership.role)}>
                    {getRoleLabel(currentOrg.myMembership.role)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || fullName === (profile.full_name || '')}
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Guardado
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
