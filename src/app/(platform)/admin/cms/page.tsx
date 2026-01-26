import { ContentCMS } from "@/frontend/components/admin/ContentCMS";

export default function AdminCMSPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-heading text-3xl font-bold text-gray-800">Gestor de Contenidos</h1>
             <p className="text-gray-600">Sube recursos para la biblioteca de participantes.</p>
            
             <ContentCMS />
        </div>
    )
}
