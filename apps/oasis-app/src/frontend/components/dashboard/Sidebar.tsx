"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/lib/utils";
import { Button } from "@/frontend/components/ui/button";
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    FileText, 
    LogOut,
    Home,
    Settings // [NUEVO] Importamos el icono
} from "lucide-react";
import { createClient } from "@/backend/supabase/client"; // Asegúrate de que esta ruta sea correcta
import Image from "next/image";
import { KatyLegacyWidget } from "@/frontend/components/layout/KatyLegacyWidget";
import { InstagramFeedWidget } from './InstagramFeedWidget';

export function Sidebar() {
    const pathname = usePathname();
    const supabase = createClient();

    const sectionMiOasis = [
        { href: "/participant", label: "Mi Viaje", icon: Home },
        { href: "/participant/resources", label: "Recursos", icon: FileText },
        { href: "/participant/community", label: "Comunidad", icon: Users },
        { href: "/admin/events", label: "Eventos", icon: Calendar }, 
    ];

    const sectionStaffOasis = [
         { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
         { href: "/admin/crm", label: "CRM", icon: Users },
    ];
    
    return (
        <aside className="w-20 md:w-64 flex flex-col justify-between py-8 px-4 h-full relative z-20 bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-2xl">
            <div className="space-y-8 flex-1 overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-center md:justify-start gap-2 px-2 shrink-0">
                    <Image src="/favicon.png" alt="OASIS" width={32} height={32} className="rounded-full shadow-sm" />
                    <span className="font-heading font-bold text-xl hidden md:block text-gray-800 tracking-tight">OASIS</span>
                </div>

                <div className="space-y-6">
                    {/* Mi OASIS Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 hidden md:block">Mi OASIS</h3>
                        <nav className="space-y-1">
                            {sectionMiOasis.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link key={link.href} href={link.href}>
                                        <div className={cn(
                                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group",
                                            isActive 
                                                ? "bg-(--neon-fuchsia) text-black shadow-lg shadow-(--neon-fuchsia)/20 font-bold" 
                                                : "text-gray-600 hover:bg-white/60 hover:text-black"
                                        )}>
                                            <Icon className={cn("h-4 w-4", isActive ? "text-black" : "text-gray-500 group-hover:text-black")} />
                                            <span className="hidden md:block text-sm">{link.label}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Staff OASIS Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 hidden md:block">Staff OASIS</h3>
                        <nav className="space-y-1">
                            {sectionStaffOasis.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href || (link.href === '/admin/crm' && pathname?.startsWith('/admin/crm'));
                                return (
                                    <Link key={link.href} href={link.href} className="block group">
                                        <div className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                            isActive 
                                                ? "bg-(--neon-fuchsia) text-black shadow-lg shadow-(--neon-fuchsia)/20 font-bold" 
                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 hover:text-gray-900"
                                        )}>
                                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-black" : "text-gray-500 group-hover:text-(--neon-fuchsia) dark:group-hover:text-white")} />
                                            <span className="hidden md:block text-sm">{link.label}</span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="space-y-4 shrink-0 mt-4">
                 {/* Instagram Feed Widget */}
                 <div className="hidden md:block">
                    <InstagramFeedWidget />
                 </div>

                 {/* Katy's Legacy Widget */}
                 <div className="hidden md:block">
                    <KatyLegacyWidget />
                 </div>

                 {/* [NUEVO] Sección Configuración integrada con tu estilo */}
                 <div className="border-t border-gray-100 pt-4 space-y-1">
                    <Link href="/settings" className="block group">
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                            pathname === "/settings"
                                ? "bg-gray-100 text-black font-bold" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}>
                            <Settings className="h-4 w-4 transition-colors group-hover:animate-spin-slow" />
                            <span className="hidden md:block text-sm">Configuración</span>
                        </div>
                    </Link>

                    <Button 
                        variant="ghost" 
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/login'; 
                        }}
                        className="w-full flex items-center justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 px-3 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:block font-medium text-sm">Salir</span>
                    </Button>
                 </div>
            </div>
        </aside>
    );
}