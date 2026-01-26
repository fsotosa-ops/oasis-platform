import { SupersetChart } from "@/frontend/components/admin/SupersetChart";

export default function AdminDashboard() {
    // Obtenemos el ID desde las variables de entorno
    const dashboardId = process.env.NEXT_PUBLIC_SUPERSET_DASHBOARD_ID || "";

    return (
        <div className="space-y-6">
            <h1 className="font-heading text-3xl font-bold text-gray-800">Panel de Control</h1>
             <p className="text-gray-600">Gestión de impacto global y eventos.</p>
   
             {dashboardId ? (
                <SupersetChart dashboardId={dashboardId} />
             ) : (
                <div className="p-8 border-2 border-dashed rounded-2xl text-center text-gray-400">
                    Configuración de Dashboard pendiente (ID no encontrado)
                </div>
             )}
        </div>
    );
}