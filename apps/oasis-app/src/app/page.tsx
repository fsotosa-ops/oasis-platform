"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";

export default function RootPage() {
  // CORRECCIÓN: Quitamos 'session' y usamos 'profile' para validar auth
  const { profile, isLoading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si no hay perfil cargado, asumimos no autenticado -> Login
    if (!profile) {
      router.replace("/login");
      return;
    }

    // Lógica de Despacho por Rol
    const role = (profile as any).role;
    const isStaff = ["owner", "admin", "facilitador", "facilitator"].includes(role) || (profile as any).is_platform_admin;

    if (isStaff) {
      const target = (role === 'facilitador' || role === 'facilitator') ? '/facilitator' : '/admin';
      router.replace(target);
    } else {
      router.replace("/participant");
    }
  }, [profile, isLoading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Cargando tu espacio...
        </p>
      </div>
    </div>
  );
}