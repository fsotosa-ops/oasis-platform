'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getContacts, Contact } from '@/frontend/actions/crm.actions';
import { ContactTable } from '@/frontend/components/crm/ContactTable';
import { Input } from '@/frontend/components/ui/input';
import { Button } from '@/frontend/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useUserActivity } from '@/frontend/hooks/useUserActivity';

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from '@/frontend/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import { Badge } from "@/frontend/components/ui/badge";
import { Label } from '@/frontend/components/ui/label';

function CrmDashboardContent() {
    const { trackInteraction } = useUserActivity();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]); // New
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // New
    const [isNewContactOpen, setIsNewContactOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
             // Mock data load
            const data = await getContacts();
            setContacts(data);
        };
        load();
    }, []);

    // Extract Unique Tags for Filter UI
    const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags))).slice(0, 10); // Limit to top 10 to avoid huge lists

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.organization && c.organization.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(c.level);
        const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(c.status);
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => c.tags.includes(tag)); // OR logic for tags, can be AND if preferred

        return matchesSearch && matchesLevel && matchesStatus && matchesTags;
    });

    const handleCreateContact = () => {
        // Here we would call createContact action
        setIsNewContactOpen(false);
        trackInteraction('CREATE_CONTACT_SUCCESS');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Todos los habitantes de nuestro OASIS</h1>
                     <p className="text-muted-foreground mt-1">Gestión centralizada de perfiles y comunidad.</p>
                </div>
                
                <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => trackInteraction('CLICK_NEW_CONTACT_MODAL')}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Habitante
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Habitante</DialogTitle>
                            <DialogDescription>
                                Añade los datos básicos para crear un perfil en el CRM.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                <Input id="name" placeholder="Ej: Marcela" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" placeholder="correo@ejemplo.com" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="org" className="text-right">Org.</Label>
                                <Input id="org" placeholder="Fundación..." className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateContact}>Guardar Habitante</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar / Search (Option B: Prominent Search) */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-6 rounded-xl border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar habitante por nombre, email o organización..." 
                        className="pl-10 h-11 bg-gray-50 dark:bg-zinc-900 border-0 ring-offset-0 focus-visible:ring-1 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className={(selectedLevels.length > 0 || selectedStatus.length > 0 || selectedTags.length > 0) ? "bg-blue-50 border-blue-200 text-blue-600 gap-2" : "gap-2"}>
                            <Filter className="h-4 w-4" />
                            <span>Filtros</span>
                            {(selectedLevels.length + selectedStatus.length + selectedTags.length) > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                    {selectedLevels.length + selectedStatus.length + selectedTags.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                        
                        {/* Filtro: Nivel */}
                        <DropdownMenuLabel>Nivel OASIS</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['Explorador', 'Activo', 'Embajador'].map((level) => (
                            <DropdownMenuCheckboxItem
                                key={level}
                                checked={selectedLevels.includes(level)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedLevels([...selectedLevels, level]);
                                    } else {
                                        setSelectedLevels(selectedLevels.filter((l) => l !== level));
                                    }
                                }}
                            >
                                {level}
                            </DropdownMenuCheckboxItem>
                        ))}
                        
                        {/* Filtro: Estatus */}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Estatus</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['active', 'inactive', 'lead'].map((status) => (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={selectedStatus.includes(status)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedStatus([...selectedStatus, status]);
                                    } else {
                                        setSelectedStatus(selectedStatus.filter((s) => s !== status));
                                    }
                                }}
                            >
                                {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'Prospecto (Lead)'}
                            </DropdownMenuCheckboxItem>
                        ))}

                        {/* Filtro: Etiquetas (Top 8 + Dynamic) */}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Etiquetas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableTags.map((tag) => (
                            <DropdownMenuCheckboxItem
                                key={tag}
                                checked={selectedTags.includes(tag)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedTags([...selectedTags, tag]);
                                    } else {
                                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                                    }
                                }}
                            >
                                {tag}
                            </DropdownMenuCheckboxItem>
                        ))}

                        {(selectedLevels.length > 0 || selectedStatus.length > 0 || selectedTags.length > 0) && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="justify-center text-center text-red-500 cursor-pointer focus:text-red-500"
                                    onClick={() => {
                                        setSelectedLevels([]);
                                        setSelectedStatus([]);
                                        setSelectedTags([]);
                                    }}
                                >
                                    Limpiar Todos
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ContactTable contacts={filteredContacts} />
        </div>
    );
}

export default function CrmDashboardPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-gray-500">Cargando dashboard...</div>}>
            <CrmDashboardContent />
        </Suspense>
    );
}
