"use client";

import { Input } from "@/frontend/components/ui/input";
import { Upload, FileText, Image as ImageIcon, Film } from "lucide-react";

export function ContentCMS() {
    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border-dashed border-2 border-gray-300 flex flex-col items-center justify-center gap-4 text-center hover:bg-white/60 transition-colors cursor-pointer">
                <div className="h-16 w-16 rounded-full bg-aurora-cyan/20 flex items-center justify-center text-aurora-cyan">
                    <Upload className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-heading font-semibold text-lg text-gray-800">Subir Contenido</h3>
                    <p className="text-sm text-gray-500">Arrastra archivos aquí o haz clic para explorar</p>
                </div>
                <Input type="file" className="hidden" />
            </div>

            <div className="space-y-4">
                <h3 className="font-heading font-semibold text-lg text-gray-800">Contenido Reciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                        { title: "Meditación Guiada.mp4", type: "video", icon: Film, bg: "bg-blue-100", color: "text-blue-600" },
                        { title: "Guía de Estrés.pdf", type: "pdf", icon: FileText, bg: "bg-red-100", color: "text-red-600" },
                        { title: "Banner Evento.jpg", type: "image", icon: ImageIcon, bg: "bg-purple-100", color: "text-purple-600" },
                     ].map((file, i) => (
                         <div key={i} className="bg-white/80 p-4 rounded-xl flex items-center gap-3 shadow-sm border border-gray-100">
                             <div className={`h-10 w-10 rounded-lg ${file.bg} flex items-center justify-center ${file.color}`}>
                                 <file.icon className="h-5 w-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <p className="font-medium text-gray-800 truncate">{file.title}</p>
                                 <p className="text-xs text-gray-400">Hace 2 horas</p>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>
    )
}
