// src/frontend/components/dashboard/Sidebar.tsx (o donde lo tengas ubicado)
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useViewMode } from "@/frontend/context/ViewModeContext"; // Nuevo Contexto
import { ViewModeSwitcher } from "@/frontend/components/layout/ViewModeSwitcher"; // Nuevo Componente
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Map, 
  LogOut,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Database
} from "lucide-react";
import { toast } from "sonner";

// Definimos la interfaz para los items del menú
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

// Menú para Admins (Plataforma y Organización)
const adminRoutes: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Journeys", href: "/admin/journeys", icon: Map },
  { title: "Usuarios", href: "/admin/participants", icon: Users },
  { title: "CRM", href: "/admin/crm", icon: Database },
  { title: "Recursos", href: "/admin/resources", icon: GraduationCap },
  { title: "Eventos", href: "/admin/events", icon: Calendar },
  { title: "Configuración", href: "/settings", icon: Settings },
];

// Menú para Participantes
const participantRoutes: SidebarItem[] = [
  { title: "Inicio", href: "/participant", icon: LayoutDashboard },
  { title: "Mis Viajes", href: "/participant/journey", icon: Map },
  { title: "Eventos", href: "/participant/events", icon: Calendar },
  { title: "Recursos", href: "/participant/resources", icon: GraduationCap },
  { title: "Comunidad", href: "/participant/community", icon: Users },
];

// Menú para Facilitadores
const facilitatorRoutes: SidebarItem[] = [
  { title: "Mi Panel", href: "/facilitator", icon: LayoutDashboard },
  { title: "Participantes", href: "/facilitator/participants", icon: Users },
  { title: "Journeys", href: "/facilitator/journeys", icon: Map },
  { title: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading, signOut } = useAuth();
  const { viewMode } = useViewMode(); // Hook para saber en qué modo estamos

  // Función de Logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logout", error);
      window.location.href = "/login";
    }
  };

  // Lógica de selección de menú REFACTORIZADA
  let items: SidebarItem[] = [];

  if (!isLoading && profile) {
    if (viewMode === 'participant') {
      // 1. Si el modo es participante, SIEMPRE mostramos rutas de participante
      // sin importar si es admin en la BD.
      items = participantRoutes;
    } else {
      // 2. Si el modo es gestión (management), decidimos qué menú de gestión mostrar
      const role = (profile as any).role;
      const isFacilitador = role === 'facilitador';
      
      // Si es facilitador, menú facilitador. Si es admin/owner, menú admin.
      if (isFacilitador) {
        items = facilitatorRoutes;
      } else {
        items = adminRoutes;
      }
    }
  }

  if (isLoading) {
    return <div className="w-64 border-r bg-background p-4 hidden md:block">Cargando menú...</div>;
  }

  return (
    <div className="relative border-r bg-background pb-0 w-64 hidden md:flex md:flex-col h-screen">
      <div className="space-y-4 py-4 flex-1 flex flex-col h-full">
        <div className="px-3 py-2 flex-1 flex flex-col overflow-hidden">
          <h2 className="mb-6 px-4 text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            OASIS
          </h2>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <nav className="grid gap-1 px-2 pb-4">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  // Lógica activa mejorada para incluir subrutas
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  
                  return (
                    <Button
                      key={index}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-all",
                        isActive && "bg-secondary font-medium shadow-sm"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </div>

        {/* ZONA INFERIOR FIJA */}
        <div className="mt-auto">
          {/* 1. Switcher de Modos (Nuevo componente) */}
          <ViewModeSwitcher />

          {/* 2. Botón de Logout */}
          <div className="p-4 border-t bg-muted/20">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}