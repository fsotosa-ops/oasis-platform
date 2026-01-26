import { Timeline } from "@/frontend/components/participant/Timeline";

export default function ParticipantHome() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div>
                    <h1 className="font-heading text-3xl font-bold text-gray-800">Mi Viaje OASIS</h1>
                    <p className="text-gray-600">Bienvenido a tu refugio digital. Aquí comienza tu camino.</p>
                 </div>
                 <div className="flex items-center gap-3">
                     <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-yellow-500">🏆</span> 150 pts
                     </div>
                     <div className="bg-aurora-cyan/10 px-4 py-2 rounded-full border border-aurora-cyan/20 text-sm font-bold text-aurora-cyan-dark">
                        Nivel: Explorador Empático
                     </div>
                 </div>
            </div>
            
            <Timeline />
        </div>
    )
}
