import { ParticipantCRM } from "@/frontend/components/admin/ParticipantCRM";

export default function AdminCRMPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-heading text-3xl font-bold text-gray-800">Participantes</h1>
             <p className="text-gray-600">Monitoreo de salud emocional y fidelización.</p>
            
             <ParticipantCRM />
        </div>
    )
}
