"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useViewMode } from "@/frontend/context/ViewModeContext";
import { ViewModeSwitcher } from "@/frontend/components/layout/ViewModeSwitcher";
import { 
  LayoutDashboard, Users, Settings, Map, LogOut, ShieldAlert,
  GraduationCap, Calendar, Database, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// --- CONFIGURACIÓN DE MENÚS ---
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminRoutes: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Journeys", href: "/admin/journeys", icon: Map },
  { title: "Usuarios", href: "/admin/participants", icon: Users },
  { title: "CRM", href: "/admin/crm", icon: Database },
  { title: "Recursos", href: "/admin/resources", icon: GraduationCap },
  { title: "Eventos", href: "/admin/events", icon: Calendar },
  { title: "Configuración", href: "/settings", icon: Settings },
];

const participantRoutes: SidebarItem[] = [
  { title: "Inicio", href: "/participant", icon: LayoutDashboard },
  { title: "Mis Viajes", href: "/participant/journey", icon: Map },
  { title: "Eventos", href: "/participant/events", icon: Calendar },
  { title: "Recursos", href: "/participant/resources", icon: GraduationCap },
  { title: "Comunidad", href: "/participant/community", icon: Users },
];

const facilitatorRoutes: SidebarItem[] = [
  { title: "Panel", href: "/facilitator", icon: LayoutDashboard },
  { title: "Grupos", href: "/facilitator/participants", icon: Users },
  { title: "Journeys", href: "/facilitator/journeys", icon: Map },
  { title: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading, signOut } = useAuth();
  const { viewMode } = useViewMode();
  
  // Estado para colapsar el sidebar
  // Puedes inicializarlo leyendo localStorage si quieres persistencia
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  // Selección dinámica de items basada en ViewModeContext
  let items: SidebarItem[] = [];

  if (!isLoading && profile) {
    if (viewMode === 'participant') {
      items = participantRoutes;
    } else {
      // Modo Gestión: Diferenciar entre Admin y Facilitador
      const role = (profile as any).role;
      if (role === 'facilitador' || role === 'facilitator') {
        items = facilitatorRoutes;
      } else {
        items = adminRoutes;
      }
    }
  }

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md z-30 hidden md:flex items-center justify-center hover:bg-accent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="space-y-4 py-4 flex-1 flex flex-col overflow-hidden">
        {/* LOGO AREA */}
        <div className={cn("px-3 py-2 h-12 flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          <div className="flex items-center gap-2 px-2 overflow-hidden">
            <ShieldAlert className="h-8 w-8 text-indigo-600 shrink-0" />
            <span className={cn(
              "text-xl font-bold tracking-tight text-foreground transition-all duration-300 whitespace-nowrap",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              OASIS
            </span>
          </div>
        </div>
        
        {/* NAVIGATION ITEMS */}
        <ScrollArea className="flex-1 px-3">
          <nav className="grid gap-2 group">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground relative group/item",
                    isActive ? "bg-accent/80 text-accent-foreground shadow-sm" : "transparent",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  
                  {/* Texto normal cuando está expandido */}
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                  )}>
                    {item.title}
                  </span>

                  {/* Tooltip flotante cuando está colapsado (Mejora UX) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                      {item.title}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* FOOTER SECTION */}
        <div className="mt-auto px-3 pb-4 space-y-2">
          {/* Switcher recibe el estado collapsed */}
          <ViewModeSwitcher collapsed={isCollapsed} />
          
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}