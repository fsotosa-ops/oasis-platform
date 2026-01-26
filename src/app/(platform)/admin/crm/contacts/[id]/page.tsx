'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getContacts, Contact } from '@/frontend/actions/crm.actions';
import { getMockEvents, UserEvent } from '@/frontend/actions/tracking.actions';
import { ActivityFeed } from '@/frontend/components/crm/ActivityFeed';
import { Button } from '@/frontend/components/ui/button';
import { Badge } from '@/frontend/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { ArrowLeft, Mail, Calendar, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    
    const [contact, setContact] = useState<Contact | null>(null);
    const [activity, setActivity] = useState<UserEvent[]>([]);

    useEffect(() => {
        const load = async () => {
            // Find contact
            const contacts = await getContacts();
            const found = contacts.find(c => c.id === id);
            setContact(found || null);

            // Find valid events (mock: assumes all events are for this user for demo, or filter if userId was implemented)
            // In a real app we would filter by userId: events.filter(e => e.userId === id)
            // For this mock demo, I'll just show all events to demonstrate the UI if the ID matches "mock" logic
            // To make it realistic, let's just show a subset
            const allEvents = await getMockEvents();
            setActivity(allEvents.reverse()); // Show all for demo effect
        };
        load();
    }, [id]);

    if (!contact) {
        return <div className="p-8">Cargando perfil...</div>;
    }

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Header / Actions */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-zinc-800 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/crm">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                            {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight leading-none">{contact.firstName} {contact.lastName}</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">{contact.organization || 'Sin organización'} • {contact.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Badge variant={contact.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider">
                        {contact.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                        <Edit2 className="mr-2 h-3 w-3" /> Editar
                    </Button>
                </div>
            </div>

            {/* 3-Column Hubspot Layout */}
            <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
                
                {/* UP-LEFT: Identity Card (Fixed) */}
                <div className="col-span-3 h-full overflow-y-auto pr-2">
                    <Card className="h-full border-0 shadow-none bg-gray-50/50 dark:bg-zinc-900/50">
                        <CardContent className="p-4 space-y-6">
                            {/* Gamification Widget */}
                            <div className="text-center p-4 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nivel Actual</span>
                                <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-orange-600 mt-1 mb-2">
                                    {contact.level || 'Explorador'}
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                    <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${((contact.xp || 0) / 1000) * 100}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground">{contact.xp || 0} XP acumulados</p>
                            </div>

                            {/* Info Properties */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 block mb-1">Correo Electrónico</label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3 text-gray-400" />
                                        <span className="truncate">{contact.email}</span>
                                    </div>
                                </div>
                                {contact.phone && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 block mb-1">Teléfono</label>
                                        <p className="text-sm font-medium">{contact.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 block mb-1">Fecha de Ingreso</label>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                        {new Date(contact.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="text-xs font-semibold text-gray-500 block mb-2">Tags</label>
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags.map(tag => (
                                            <Badge key={tag} variant="outline" className="bg-white">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER: Activity Timeline (Scrollable) */}
                <div className="col-span-6 h-full overflow-y-auto px-2">
                     <div className="bg-white dark:bg-zinc-950 rounded-xl border shadow-sm min-h-full">
                        <div className="p-4 border-b bg-gray-50/30 sticky top-0 backdrop-blur z-10">
                            <h3 className="font-semibold text-sm">Historial de Actividad</h3>
                        </div>
                        <div className="p-4">
                            <ActivityFeed 
                                events={activity} 
                                title="" 
                                description=""
                                emptyMessage="No hay actividad registrada en el timeline."
                            />
                        </div>
                     </div>
                </div>

                {/* RIGHT: Context / Widgets */}
                <div className="col-span-3 h-full overflow-y-auto pl-2 space-y-4">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm font-semibold">Próximos Pasos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 text-sm text-muted-foreground">
                            <div className="flex gap-2 items-start p-2 bg-yellow-50 text-yellow-800 rounded-md">
                                <div className="h-2 w-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                                <p className="text-xs">Enviar invitación al Taller de Verano (Pendiente)</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm font-semibold">Insignias</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-3 gap-2">
                            <div title="Primer Taller" className="aspect-square rounded-full bg-blue-100 flex items-center justify-center text-xl grayscale opacity-50 cursor-help">
                                🎓
                            </div>
                            <div title="Lector Voraz" className="aspect-square rounded-full bg-green-100 flex items-center justify-center text-xl cursor-help">
                                📚
                            </div>
                             <div title="Conectado" className="aspect-square rounded-full bg-purple-100 flex items-center justify-center text-xl grayscale opacity-50 cursor-help">
                                🤝
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
