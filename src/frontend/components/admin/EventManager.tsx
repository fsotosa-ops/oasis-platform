"use client";

import { useState } from "react";
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
import { Calendar, Plus, Search, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";

const initialEvents = [
    { id: 1, title: "Taller de Empatía Corporativa", date: "2024-10-15", participants: 24, status: "Programado" },
    { id: 2, title: "Webinar: Pausa Sagrada", date: "2024-10-20", participants: 150, status: "Abierto" },
    { id: 3, title: "Círculo de Escucha Activa", date: "2024-10-12", participants: 15, status: "Finalizado" },
];

export function EventManager() {
    const [events] = useState(initialEvents);
    const [selectedEvent, setSelectedEvent] = useState<typeof initialEvents[0] | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar evento..." className="pl-10 bg-white" />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Evento</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Participantes</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow 
                                key={event.id} 
                                className="hover:bg-gray-50/50 cursor-pointer"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-aurora-cyan/20 flex items-center justify-center text-aurora-pink">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        {event.title}
                                    </div>
                                </TableCell>
                                <TableCell>{event.date}</TableCell>
                                <TableCell>{event.participants}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        event.status === 'Programado' ? 'bg-blue-100 text-blue-700' :
                                        event.status === 'Abierto' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {event.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Cancelar evento</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Event Details Modal */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription>Detalles del evento seleccionado.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Fecha:</span>
                            <span className="col-span-3">{selectedEvent?.date}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Estado:</span>
                            <span className="col-span-3">{selectedEvent?.status}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <span className="font-bold text-right">Inscritos:</span>
                            <span className="col-span-3">{selectedEvent?.participants}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
