'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileForm } from '@/features/settings/components/ProfileForm';
import { TeamManager } from '@/features/settings/components/TeamManager';
import { OrganizationSettings } from '@/features/settings/components/OrganizationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { RoleGuard } from '@/shared/components/guards/RoleGuard';
import { Settings, Users, Building2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { isLoading, currentOrg, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Sesión no iniciada</h2>
          <p className="text-gray-500 mt-2">Inicia sesión para acceder a la configuración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu perfil y la configuración de tu organización
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/60 backdrop-blur-sm border border-gray-200/50 p-1 rounded-xl">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Perfil</span>
          </TabsTrigger>

          <TabsTrigger
            value="team"
            disabled={!currentOrg}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Equipo</span>
          </TabsTrigger>

          <RoleGuard minRole="admin">
            <TabsTrigger
              value="organization"
              disabled={!currentOrg}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organización</span>
            </TabsTrigger>
          </RoleGuard>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-6">
          {currentOrg ? (
            <TeamManager />
          ) : (
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Sin organización</h3>
              <p className="text-gray-500 mt-2">No perteneces a ninguna organización actualmente.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="organization" className="space-y-6 mt-6">
          <RoleGuard minRole="admin" fallback={
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Acceso restringido</h3>
              <p className="text-gray-500 mt-2">Solo administradores pueden ver esta sección.</p>
            </div>
          }>
            <OrganizationSettings />
          </RoleGuard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
