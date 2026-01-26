'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getContacts, Contact } from '@/frontend/actions/crm.actions';
import { ContactTable } from '@/frontend/components/crm/ContactTable';
import { Input } from '@/frontend/components/ui/input';
import { Button } from '@/frontend/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { useUserActivity } from '@/frontend/hooks/useUserActivity';

function ContactsContent() {
    const { trackInteraction } = useUserActivity();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            const data = await getContacts();
            setContacts(data);
        };
        load();
    }, []);

    const filteredContacts = contacts.filter(c => 
        c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-xl font-bold tracking-tight">Directorio de Contactos</h2>
                     <p className="text-sm text-muted-foreground">Gestiona a todos los miembros de tu comunidad.</p>
                </div>
                <Button onClick={() => trackInteraction('CLICK_NEW_CONTACT')}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Contacto
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por nombre o email..." 
                        className="pl-9 bg-gray-50 dark:bg-zinc-900 border-0 ring-offset-0 focus-visible:ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <ContactTable contacts={filteredContacts} />
        </div>
    );
}

export default function ContactsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando directorio...</div>}>
            <ContactsContent />
        </Suspense>
    );
}
