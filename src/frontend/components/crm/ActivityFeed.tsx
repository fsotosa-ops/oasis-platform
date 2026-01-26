'use client';

import React from 'react';
import { UserEvent } from '@/frontend/actions/tracking.actions';
import { ScrollArea } from '@/frontend/components/ui/scroll-area';

interface ActivityFeedProps {
    events: UserEvent[];
    title?: string;
    description?: string;
    emptyMessage?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
    events, 
    title = "Feed de Actividad", 
    description = "Registro de acciones recientes",
    emptyMessage = "No hay actividad registrada."
}) => {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 rounded-xl border shadow-sm overflow-hidden">
                <ScrollArea className="h-[400px] w-full p-4">
                    {events.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">{emptyMessage}</p>
                    ) : (
                        <div className="space-y-0">
                            {events.map((event, idx) => (
                                <div key={idx} className="flex gap-4 pb-6 relative group">
                                     {/* Timeline Line */}
                                    {idx !== events.length - 1 && (
                                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200 dark:bg-zinc-800" />
                                    )}
                                    
                                    <div className="relative z-10 shrink-0 h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                            {event.type.substring(0, 3)}
                                        </span>
                                    </div>

                                    <div className="flex-1 pt-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">
                                                {formatEventType(event.type)}
                                            </p>
                                            <time className="text-xs text-muted-foreground tabular-nums">
                                                {new Date(event.timestamp).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </time>
                                        </div>
                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900 rounded p-2 mt-1">
                                                {/* Be smarter about displaying metadata */}
                                                {event.metadata.url ? (
                                                     <span className="truncate block max-w-xs">{event.metadata.url}</span>
                                                ) : <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(event.metadata, null, 2)}</pre>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

// Helper utility
const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};
