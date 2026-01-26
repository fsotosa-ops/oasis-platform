'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { getWorkshops, Workshop } from '@/frontend/actions/crm.actions';
import { WorkshopCard } from '@/frontend/components/crm/WorkshopCard';
import { Button } from '@/frontend/components/ui/button';
import { Plus } from 'lucide-react';
import { useUserActivity } from '@/frontend/hooks/useUserActivity';

function WorkshopsContent() {
    const { trackInteraction } = useUserActivity();
    const [workshops, setWorkshops] = useState<Workshop[]>([]);

    useEffect(() => {
        const load = async () => {
             const data = await getWorkshops();
             setWorkshops(data);
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h2 className="text-xl font-bold tracking-tight">Talleres y Eventos</h2>
                     <p className="text-sm text-muted-foreground">Administra tus próximos eventos y listas de asistencia.</p>
                </div>
                <Button onClick={() => trackInteraction('CLICK_NEW_WORKSHOP')}>
                    <Plus className="mr-2 h-4 w-4" /> Crear Taller
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workshops.map(workshop => (
                    <WorkshopCard key={workshop.id} workshop={workshop} />
                ))}
            </div>
        </div>
    );
}

export default function WorkshopsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando talleres...</div>}>
            <WorkshopsContent />
        </Suspense>
    );
}
