"use client";

import { ResourceCard } from "@/frontend/components/participant/ResourceCard";
import { ScrollArea, ScrollBar } from "@/frontend/components/ui/scroll-area";

import { AdminActionButton } from "@/frontend/components/admin/AdminActionButton";

export default function ResourcesPage() {
    const resources = [
        { title: "Técnica de la Pausa Sagrada", type: "video" as const, duration: "3 min", image: "/placeholder_meditation.jpg" },
        { title: "Guía de Validación Emocional", type: "guide" as const, duration: "Lectura 5m", image: "/placeholder_guide.jpg" },
        { title: "Neurociencia de la Calma", type: "article" as const, duration: "Lectura 10m", image: "/placeholder_brain.jpg" },
        { title: "Cómo acompañar en crisis", type: "video" as const, duration: "8 min", image: "/placeholder_holding.jpg" },
        { title: "El poder del Silencio", type: "guide" as const, duration: "Lectura 3m", image: "/placeholder_silence.jpg" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-gray-800 dark:text-gray-100">Biblioteca de Recursos</h1>
                    <p className="text-gray-600 dark:text-gray-400">Herramientas rápidas para momentos que importan.</p>
                </div>
                <AdminActionButton label="Subir Recurso" type="create" entityName="Recurso" />
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-700">Categorías</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Ansiedad", "Crianza", "Liderazgo", "Autocuidado"].map((cat) => (
                        <div key={cat} className="h-24 rounded-2xl bg-white/60 hover:bg-white border border-white/50 flex items-center justify-center font-bold text-gray-600 shadow-sm cursor-pointer transition-colors">
                            {cat}
                        </div>
                    ))}
                </div>

                <h2 className="text-lg font-semibold text-gray-700">Explora lo Nuevo</h2>
                <ScrollArea className="w-full whitespace-nowrap rounded-3xl pb-4">
                    <div className="flex w-max space-x-6 p-4">
                        {resources.map((res, i) => (
                            <ResourceCard key={i} {...res} />
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    )
}
