'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RoleSelect } from './RoleSelect';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Mail, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { OrganizationRole } from '@/core/types';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: OrganizationRole) => Promise<void>;
  currentUserRole: OrganizationRole;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onInvite,
  currentUserRole,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('participante');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Determine which roles the current user can assign
  const getExcludedRoles = (): OrganizationRole[] => {
    // Owners can assign any role except owner
    if (currentUserRole === 'owner') return ['owner'];
    // Admins can assign facilitador and participante
    if (currentUserRole === 'admin') return ['owner', 'admin'];
    // Others can only assign participante
    return ['owner', 'admin', 'facilitador'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('El email no es válido');
      return;
    }

    setIsSubmitting(true);

    try {
      await onInvite(email.trim(), role);
      setSuccess(true);
      // Reset form after success
      setTimeout(() => {
        setEmail('');
        setRole('participante');
        setSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la invitación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setRole('participante');
      setError(null);
      setSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invitar Miembro
          </DialogTitle>
          <DialogDescription>
            Envía una invitación por email para unirse a tu organización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Role select */}
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <RoleSelect
              value={role}
              onChange={setRole}
              disabled={isSubmitting}
              excludeRoles={getExcludedRoles()}
            />
            <p className="text-xs text-muted-foreground">
              El rol determina los permisos del miembro en la organización.
            </p>
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
                Invitación enviada correctamente.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || success}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
