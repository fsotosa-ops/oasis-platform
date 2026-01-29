'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import type { OrganizationRole } from '@/core/types';

interface RoleSelectProps {
  value: OrganizationRole;
  onChange: (value: OrganizationRole) => void;
  disabled?: boolean;
  excludeRoles?: OrganizationRole[];
  className?: string;
}

const ROLE_OPTIONS: {
  value: OrganizationRole;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    value: 'owner',
    label: 'Propietario',
    description: 'Control total de la organización',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Gestión de miembros y configuración',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'facilitador',
    label: 'Facilitador',
    description: 'Crear y gestionar journeys',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'participante',
    label: 'Participante',
    description: 'Acceso a journeys asignados',
    color: 'bg-gray-100 text-gray-800',
  },
];

export function RoleSelect({
  value,
  onChange,
  disabled = false,
  excludeRoles = [],
  className,
}: RoleSelectProps) {
  const availableRoles = ROLE_OPTIONS.filter(
    (role) => !excludeRoles.includes(role.value)
  );

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccionar rol" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center gap-2">
              <span>{role.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RoleBadgeProps {
  role: OrganizationRole;
  size?: 'sm' | 'md';
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const roleOption = ROLE_OPTIONS.find((r) => r.value === role);
  if (!roleOption) return null;

  return (
    <Badge
      variant="secondary"
      className={`${roleOption.color} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {roleOption.label}
    </Badge>
  );
}

export { ROLE_OPTIONS };
