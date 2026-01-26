import { AdminActionButton } from "@/frontend/components/admin/AdminActionButton";
import { EventManager } from "@/frontend/components/admin/EventManager";

export default function AdminEventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="font-heading text-3xl font-bold text-gray-800">Gestor de Eventos</h1>
                     <p className="text-gray-600">Programa talleres y automatiza el seguimiento.</p>
                </div>
                <AdminActionButton label="Programar Evento" type="create" entityName="Evento" />
            </div>
            
             <EventManager />
        </div>
    )
}
