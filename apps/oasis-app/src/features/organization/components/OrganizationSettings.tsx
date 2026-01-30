'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createClient } from '@/backend/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import {
  Building2,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Palette,
} from 'lucide-react';
import type { OrganizationType } from '@/core/types';

interface OrgFormData {
  name: string;
  slug: string;
  description: string;
  type: OrganizationType;
  logo_url: string;
  primary_color: string;
}

const ORG_TYPES: { value: OrganizationType; label: string; description: string }[] = [
  {
    value: 'community',
    label: 'Comunidad',
    description: 'Para comunidades y grupos sociales',
  },
  {
    value: 'provider',
    label: 'Proveedor',
    description: 'Para proveedores de servicios',
  },
  {
    value: 'sponsor',
    label: 'Patrocinador',
    description: 'Para patrocinadores y benefactores',
  },
  {
    value: 'enterprise',
    label: 'Empresa',
    description: 'Para organizaciones empresariales',
  },
];

export function OrganizationSettings() {
  const { currentOrg, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<OrgFormData>({
    name: '',
    slug: '',
    description: '',
    type: 'community',
    logo_url: '',
    primary_color: '#6366f1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const supabase = createClient();

  // Initialize form with org data
  useEffect(() => {
    if (currentOrg) {
      setFormData({
        name: currentOrg.data.name || '',
        slug: currentOrg.data.slug || '',
        description: currentOrg.data.description || '',
        type: currentOrg.data.type || 'community',
        logo_url: currentOrg.data.logo_url || '',
        primary_color: currentOrg.data.settings?.branding?.primaryColor || '#6366f1',
      });
    }
  }, [currentOrg]);

  // Validate slug format
  const validateSlug = (slug: string): boolean => {
    if (!slug) return true;
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  };

  const handleSlugChange = (value: string) => {
    const normalizedSlug = value.toLowerCase().replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, slug: normalizedSlug }));

    if (!validateSlug(normalizedSlug)) {
      setSlugError('El slug solo puede contener letras, números y guiones');
    } else {
      setSlugError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    if (!validateSlug(formData.slug)) {
      setSlugError('El slug solo puede contener letras, números y guiones');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if slug is already taken (by another org)
      if (formData.slug !== currentOrg.data.slug) {
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', currentOrg.data.id)
          .single();

        if (existingOrg) {
          setSlugError('Este slug ya está en uso');
          setIsSubmitting(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          type: formData.type,
          logo_url: formData.logo_url.trim() || null,
          settings: {
            ...currentOrg.data.settings,
            branding: {
              ...currentOrg.data.settings?.branding,
              primaryColor: formData.primary_color,
              logoUrl: formData.logo_url.trim() || null,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrg.data.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating organization:', err);
      setError(
        err instanceof Error ? err.message : 'Error al actualizar la organización'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOrg) {
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
      {/* Basic Info Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Información de la Organización
          </CardTitle>
          <CardDescription>
            Configura los datos básicos de tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Organización *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mi Organización"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Identificador (slug) *</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="slug"
                  type="text"
                  placeholder="mi-organizacion"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`pl-10 ${slugError ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {slugError ? (
                <p className="text-xs text-destructive">{slugError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  URL: oasis.app/org/{formData.slug || 'mi-organizacion'}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu organización..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Organization type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Organización</Label>
              <Select
                value={formData.type}
                onValueChange={(value: OrganizationType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Branding section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Personalización
              </h3>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="logo_url"
                    type="url"
                    placeholder="https://ejemplo.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
                    }
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Primary color */}
              <div className="space-y-2">
                <Label htmlFor="primary_color">Color Principal</Label>
                <div className="flex gap-3">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primary_color: e.target.value,
                      }))
                    }
                    className="w-14 h-10 p-1 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        primary_color: e.target.value,
                      }))
                    }
                    placeholder="#6366f1"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success message */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Organización actualizada correctamente.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !!slugError}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Organization Info Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-base">Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <p className="font-mono text-xs mt-1">{currentOrg.data.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <div className="mt-1">
                <Badge variant="secondary">
                  {ORG_TYPES.find((t) => t.value === currentOrg.data.type)?.label ||
                    currentOrg.data.type}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Creada:</span>
              <p className="font-medium">
                {new Date(currentOrg.data.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tu rol:</span>
              <div className="mt-1">
                <Badge className="capitalize">
                  {currentOrg.myMembership.role}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
