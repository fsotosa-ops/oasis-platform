"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Search, Mail, Filter } from "lucide-react";

export function ParticipantCRM() {
    const participants = [
        { id: 1, name: "Ana P.", organization: "TechCorp", health: 8.5, status: "Promotor" },
        { id: 2, name: "Carlos M.", organization: "Educa", health: 6.2, status: "Riesgo" },
        { id: 3, name: "Sofia L.", organization: "TechCorp", health: 9.0, status: "Promotor" },
        { id: 4, name: "Miguel R.", organization: "Bankia", health: 7.5, status: "Neutro" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar por nombre o empresa..." className="pl-10 bg-white" />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filtros
                </Button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Participante</TableHead>
                            <TableHead>Organización</TableHead>
                            <TableHead>Health Score</TableHead>
                            <TableHead>Status NPS</TableHead>
                            <TableHead className="text-right">Contacto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell>{p.organization}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={
                                            p.health >= 8 ? "text-green-600 font-bold" : 
                                            p.health < 7 ? "text-red-500 font-bold" : "text-yellow-600 font-bold"
                                        }>{p.health}</span>
                                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                     p.health >= 8 ? "bg-green-500" : 
                                                     p.health < 7 ? "bg-red-500" : "bg-yellow-500"
                                                }`} 
                                                style={{ width: `${p.health * 10}%` }} 
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        p.status === 'Promotor' ? 'bg-purple-100 text-purple-700' :
                                        p.status === 'Riesgo' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {p.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="ghost">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
