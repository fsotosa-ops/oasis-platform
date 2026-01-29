"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

export type ViewMode = "management" | "participant";

interface ViewModeContextType {
  viewMode: ViewMode;
  isStaff: boolean;
  toggleViewMode: () => void;
  isLoading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Definición centralizada de roles con permisos de gestión
const STAFF_ROLES = ["owner", "admin", "facilitador", "facilitator"];
const STORAGE_KEY = "oasis_view_mode_preference";

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const { profile, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("participant");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Determinación segura del rol
  const userRole = (profile as any)?.role || "";
  const isPlatformAdmin = (profile as any)?.is_platform_admin || false;
  const isStaff = STAFF_ROLES.includes(userRole) || isPlatformAdmin;

  useEffect(() => {
    // 1. Bloqueo hasta que la autenticación termine
    if (authLoading) return;

    // 2. Si no es staff, forzamos modo participante y marcamos como inicializado
    if (!isStaff) {
      setViewMode("participant");
      setIsInitialized(true);
      return;
    }

    // 3. Lógica de recuperación de estado para Staff
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) as ViewMode : null;
    
    // CASO CRÍTICO: Si el usuario navega directamente a una URL de admin, 
    // forzamos el modo management para evitar inconsistencia visual.
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/facilitator')) {
       setViewMode("management");
    } 
    // Si tiene una preferencia guardada válida
    else if (savedMode && (savedMode === "management" || savedMode === "participant")) {
      setViewMode(savedMode);
    } 
    // Default para staff: Gestión
    else {
      setViewMode("management");
    }
    
    setIsInitialized(true);
  }, [profile, isStaff, authLoading, pathname]);

  const toggleViewMode = () => {
    if (!isStaff) return;

    const newMode = viewMode === "management" ? "participant" : "management";
    
    // Actualizar estado y persistencia
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }

    toast.info(`Cambiando a vista de ${newMode === "management" ? "Gestión" : "Participante"}`);

    // Redirección inteligente basada en el rol
    if (newMode === "management") {
      const targetPath = userRole === "facilitador" || userRole === "facilitator" 
        ? "/facilitator" 
        : "/admin";
      router.push(targetPath);
    } else {
      router.push("/participant");
    }
  };

  // Prevenimos renderizado de hijos hasta determinar el modo correcto
  // Esto soluciona el "parpadeo" de UI incorrecta
  if (authLoading || !isInitialized) {
    return null; // O un componente <LoadingSpinner /> global
  }

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        isStaff,
        toggleViewMode,
        isLoading: !isInitialized,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}