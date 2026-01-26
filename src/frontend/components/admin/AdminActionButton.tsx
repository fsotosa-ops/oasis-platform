'use client';

import React from 'react';
import { Button } from '@/frontend/components/ui/button';
import { PlusCircle, Edit, Settings } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter 
} from '@/frontend/components/ui/dialog';
import { Label } from '@/frontend/components/ui/label';
import { Input } from '@/frontend/components/ui/input';

interface AdminActionProps {
    label: string;
    type: 'create' | 'edit' | 'settings';
    entityName: string; // e.g., "Recurso", "Evento"
    onAction?: () => void;
}

export const AdminActionButton = ({ label, type, entityName, onAction }: AdminActionProps) => {
    // In a real app, check user role here.
    // const { user } = useAuth();
    // if (user.role !== 'admin') return null;

    const Icon = type === 'create' ? PlusCircle : type === 'edit' ? Edit : Settings;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                    <Icon className="mr-2 h-4 w-4" /> {label}
                </Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{type === 'create' ? `Crear Nuevo ${entityName}` : `Editar ${entityName}`}</DialogTitle>
                    <DialogDescription>
                        Acción administrativa para gestionar contenido en la plataforma.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" placeholder={`Título del ${entityName.toLowerCase()}`} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desc" className="text-right">Detalle</Label>
                        <Input id="desc" placeholder="Descripción breve..." className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => {
                        // Mock action
                        if(onAction) onAction();
                        alert(`${entityName} guardado (Simulación)`);
                    }}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
