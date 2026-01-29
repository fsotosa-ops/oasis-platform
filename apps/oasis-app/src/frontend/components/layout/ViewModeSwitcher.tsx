// src/frontend/components/layout/ViewModeSwitcher.tsx
"use client";

import { useViewMode } from "@/frontend/context/ViewModeContext";
// CORRECCIÓN AQUÍ: Rutas apuntando a @/shared/...
import { Button } from "@/shared/components/ui/button"; 
import { cn } from "@/shared/lib/utils";
import { Repeat, LayoutDashboard, User } from "lucide-react";

interface ViewModeSwitcherProps {
  collapsed?: boolean;
  className?: string;
}

export function ViewModeSwitcher({ collapsed, className }: ViewModeSwitcherProps) {
  const { isStaff, viewMode, toggleViewMode } = useViewMode();

  if (!isStaff) return null;

  const isManagement = viewMode === "management";

  return (
    <div className={cn("px-2 py-2 border-t border-border mt-auto", className)}>
      <Button
        variant="outline"
        onClick={toggleViewMode}
        className={cn(
          "w-full transition-all duration-300 gap-2 overflow-hidden",
          isManagement 
            ? "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent",
            collapsed ? "justify-center px-0" : "justify-start"
        )}
        title={isManagement ? "Cambiar a vista Participante" : "Volver a Gestión"}
      >
        {isManagement ? (
          <User className="h-4 w-4 shrink-0" />
        ) : (
          <LayoutDashboard className="h-4 w-4 shrink-0" />
        )}

        {!collapsed && (
          <span className="truncate font-medium">
            {isManagement ? "Ver como Participante" : "Volver a Gestión"}
          </span>
        )}
        
        {!collapsed && isManagement && <Repeat className="ml-auto h-3 w-3 opacity-50" />}
      </Button>
      
      {!collapsed && !isManagement && (
        <p className="text-[10px] text-center mt-2 text-muted-foreground animate-in fade-in">
          Estás viendo la plataforma como un usuario.
        </p>
      )}
    </div>
  );
}