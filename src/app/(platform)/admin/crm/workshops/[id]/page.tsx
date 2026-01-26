'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWorkshops, Workshop, getContacts, Contact } from '@/frontend/actions/crm.actions';
import { useUserActivity } from '@/frontend/hooks/useUserActivity';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Badge } from '@/frontend/components/ui/badge';
import { ArrowLeft, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function WorkshopDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { trackInteraction } = useUserActivity();
    
    const [workshop, setWorkshop] = useState<Workshop | null>(null);
    // Mock registrants logic: just take first 3 contacts for demo
    const [registrants, setRegistrants] = useState<Contact[]>([]);

    useEffect(() => {
        const load = async () => {
            const workshops = await getWorkshops();
            setWorkshop(workshops.find(w => w.id === id) || null);

            const contacts = await getContacts();
            setRegistrants(contacts.slice(0, 5)); // Mock: assume these are registered
        };
        load();
    }, [id]);

    if (!workshop) return <div className="p-8">Cargando taller...</div>;

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/crm/workshops">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">{workshop.title}</h1>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(workshop.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="outline">{workshop.status}</Badge>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Attendance List */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Lista de Asistencia</CardTitle>
                            <Button size="sm" variant="outline">Exportar CSV</Button>
                        </CardHeader>
                        <CardContent>
                             <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {registrants.map(contact => (
                                    <div key={contact.id} className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                                                {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{contact.firstName} {contact.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={() => trackInteraction('MARK_ATTENDANCE', { contactId: contact.id, workshopId: workshop.id })}
                                            >
                                                <CheckCircle2 className="mr-2 h-3 w-3" /> Presente
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                 <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Capacidad</span>
                                <span className="font-medium">{workshop.capacity} personas</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Inscritos</span>
                                <span className="font-medium">{workshop.enrolledCount}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Disponibilidad</span>
                                <span className="font-medium text-green-600">{workshop.capacity - workshop.enrolledCount} lugares</span>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
