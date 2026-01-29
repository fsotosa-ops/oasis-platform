// src/frontend/context/ViewModeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth"; // Usamos tu hook existente
import { toast } from "sonner";

export type ViewMode = "management" | "participant";

interface ViewModeContextType {
  viewMode: ViewMode;
  isStaff: boolean;
  toggleViewMode: () => void;
  isLoading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Ajusta estos roles según como los tengas en tu BD ('facilitador' vs 'facilitator')
const STAFF_ROLES = ["owner", "admin", "facilitador", "facilitator"]; 
const STORAGE_KEY = "oasis_view_mode_preference";

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // CORRECCIÓN AQUÍ: Usamos 'profile' en lugar de 'userProfile'
  const { profile, isLoading: authLoading } = useAuth();
  
  const [viewMode, setViewMode] = useState<ViewMode>("participant");
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Verificamos si tiene rol de staff accediendo a la propiedad role del profile
  const isStaff = profile ? STAFF_ROLES.includes((profile as any).role || "") || profile.is_platform_admin : false;

  useEffect(() => {
    if (authLoading) return;

    if (!isStaff) {
      setViewMode("participant");
      setIsInitialized(true);
      return;
    }

    const savedMode = localStorage.getItem(STORAGE_KEY) as ViewMode;
    if (savedMode && (savedMode === "management" || savedMode === "participant")) {
      setViewMode(savedMode);
    } else {
      setViewMode("management");
    }
    setIsInitialized(true);
  }, [profile, isStaff, authLoading]);

  const toggleViewMode = () => {
    if (!isStaff) return;

    const newMode = viewMode === "management" ? "participant" : "management";
    
    setViewMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);

    toast.info(`Cambiando a vista de ${newMode === "management" ? "Gestión" : "Participante"}`);

    if (newMode === "management") {
      const role = (profile as any)?.role;
      // Ajusta la redirección según tus roles exactos
      const targetPath = role === "facilitador" ? "/facilitator" : "/admin";
      router.push(targetPath);
    } else {
      router.push("/participant");
    }
  };

  if (!isInitialized && authLoading) return null; 

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