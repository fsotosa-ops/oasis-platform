"use client";

import { useViewMode } from "@/frontend/context/ViewModeContext";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Repeat, LayoutDashboard, User } from "lucide-react";

interface ViewModeSwitcherProps {
  collapsed?: boolean;
  className?: string;
}

export function ViewModeSwitcher({ collapsed, className }: ViewModeSwitcherProps) {
  const { isStaff, viewMode, toggleViewMode } = useViewMode();

  // Si no es staff, este componente no debe renderizarse
  if (!isStaff) return null;

  const isManagement = viewMode === "management";

  return (
    <div className={cn("py-2 border-t border-border mt-auto", className)}>
      <Button
        variant="outline"
        onClick={toggleViewMode}
        size={collapsed ? "icon" : "default"}
        className={cn(
          "transition-all duration-300 gap-2 overflow-hidden w-full",
          isManagement 
            ? "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent",
          collapsed ? "px-0 justify-center aspect-square" : "justify-start px-4"
        )}
        title={isManagement ? "Cambiar a vista Participante" : "Volver a Gestión"}
      >
        {isManagement ? (
          <User className="h-4 w-4 shrink-0" />
        ) : (
          <LayoutDashboard className="h-4 w-4 shrink-0" />
        )}

        {!collapsed && (
          <>
            <span className="truncate font-medium flex-1 text-left">
              {isManagement ? "Modo Usuario" : "Modo Gestión"}
            </span>
            <Repeat className="h-3 w-3 opacity-50 shrink-0 ml-1" />
          </>
        )}
      </Button>
      
      {!collapsed && !isManagement && (
        <p className="text-[10px] text-center mt-2 text-muted-foreground animate-in fade-in slide-in-from-top-1">
          Estás previsualizando como participante
        </p>
      )}
    </div>
  );
}