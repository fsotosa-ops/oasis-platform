import { SROIDashboard } from "@/frontend/components/collaborator/SROIDashboard";
import { Button } from "@/frontend/components/ui/button";
import { Download } from "lucide-react";

export default function CollaboratorDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="font-heading text-3xl font-bold text-gray-800">Panel de Impacto</h1>
                     <p className="text-gray-600">Visualiza el retorno social de tu inversión en bienestar.</p>
                </div>
                <Button className="gap-2 bg-aurora-purple hover:bg-aurora-purple/80 text-white">
                    <Download className="h-4 w-4" /> Descargar Reporte PDF
                </Button>
            </div>
            
             <SROIDashboard />
        </div>
    )
}
