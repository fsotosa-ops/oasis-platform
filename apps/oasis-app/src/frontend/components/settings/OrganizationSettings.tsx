'use client';

import { useState } from 'react';
import { useAuth } from '@/frontend/context/UserProvider';
import { createClient } from '@/backend/supabase/client';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Label } from '@/frontend/components/ui/label';
import { Textarea } from '@/frontend/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { RoleGuard } from '@/frontend/components/auth/RoleGuard';
import {
  Building2,
  Globe,
  Settings,
  Loader2,
  Check,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/frontend/components/ui/dialog';

export function OrganizationSettings() {
  const { currentOrg, profile } = useAuth();
  const supabase = createClient();

  const [name, setName] = useState(currentOrg?.data.name || '');
  const [description, setDescription] = useState(currentOrg?.data.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!currentOrg) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrg.data.id);

      if (updateError) throw updateError;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrg || deleteConfirm !== currentOrg.data.slug) return;

    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', currentOrg.data.id);

      if (deleteError) throw deleteError;

      // Redirect to home after deletion
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la organización');
      setIsDeleting(false);
    }
  };

  const getOrgTypeBadge = (type: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      community: { bg: 'bg-green-100 text-green-700', label: 'Comunidad' },
      provider: { bg: 'bg-blue-100 text-blue-700', label: 'Proveedor' },
      sponsor: { bg: 'bg-purple-100 text-purple-700', label: 'Patrocinador' },
      enterprise: { bg: 'bg-amber-100 text-amber-700', label: 'Empresa' }
    };
    return config[type] || { bg: 'bg-gray-100 text-gray-700', label: type };
  };

  if (!currentOrg) return null;

  const orgType = getOrgTypeBadge(currentOrg.data.type);
  const isDefaultOrg = currentOrg.data.settings?.is_default === true;

  return (
    <div className="space-y-6">
      {/* Organization Info Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                Información de la Organización
              </CardTitle>
              <CardDescription>
                Configura los datos básicos de tu organización.
              </CardDescription>
            </div>
            <Badge className={orgType.bg}>{orgType.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Slug (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              Identificador (Slug)
            </Label>
            <Input
              id="slug"
              value={currentOrg.data.slug}
              disabled
              className="bg-gray-50 text-gray-500 font-mono"
            />
            <p className="text-xs text-gray-400">
              El identificador único no se puede cambiar.
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="orgName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              Nombre de la Organización
            </Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de tu organización"
              className="bg-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu organización..."
              className="bg-white resize-none"
              rows={3}
            />
          </div>

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
              disabled={isSaving || (name === currentOrg.data.name && description === (currentOrg.data.description || ''))}
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

      {/* Features Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            Características Activas
          </CardTitle>
          <CardDescription>
            Funcionalidades habilitadas para esta organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {currentOrg.data.settings?.features?.map((feature: string) => (
              <Badge key={feature} variant="outline" className="bg-gray-50">
                {feature.replace(/_/g, ' ')}
              </Badge>
            )) || (
              <p className="text-sm text-gray-500">No hay características especiales configuradas.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Only for owners and non-default orgs */}
      <RoleGuard allowedRoles={['owner']}>
        {!isDefaultOrg && (
          <Card className="bg-red-50/50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription className="text-red-600">
                Acciones irreversibles que afectan a toda la organización.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-gray-900">Eliminar Organización</p>
                  <p className="text-sm text-gray-500">
                    Esta acción eliminará permanentemente la organización y todos sus datos.
                  </p>
                </div>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Eliminar Organización</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todos los
                        datos de la organización, incluyendo miembros y configuraciones.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">
                          Para confirmar, escribe <strong className="font-mono">{currentOrg.data.slug}</strong> a continuación:
                        </p>
                      </div>

                      <Input
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={currentOrg.data.slug}
                        className="font-mono"
                      />
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteConfirm !== currentOrg.data.slug || isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar Permanentemente'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </RoleGuard>
    </div>
  );
}
