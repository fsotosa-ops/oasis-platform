'use client';

import React from 'react';
import { Contact } from '@/frontend/actions/crm.actions';
import { Button } from '@/frontend/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/frontend/components/ui/badge';

interface ContactTableProps {
    contacts: Contact[];
}

export const ContactTable: React.FC<ContactTableProps> = ({ contacts }) => {
    return (
        <div className="w-full overflow-hidden rounded-xl border shadow-sm bg-white dark:bg-zinc-950">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-zinc-900 border-b">
                    <tr>
                        <th className="px-6 py-4 font-medium text-gray-500">Nombre</th>
                        <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                        <th className="px-6 py-4 font-medium text-gray-500">Tags</th>
                        <th className="px-6 py-4 font-medium text-gray-500">Health Score</th>
                        <th className="px-6 py-4 font-medium text-gray-500 text-right">Rango OASIS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {contacts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                No se encontraron contactos.
                            </td>
                        </tr>
                    ) : (
                        contacts.map((contact) => {
                             // Polynomial Simulation: (XP / 20) + (Engagement * 0.5)
                             // Max cap at 100
                             const rawScore = (contact.xp * 0.05) + (contact.engagementScore * 0.5);
                             const healthScore = Math.min(Math.round(rawScore), 100);
                             
                             let healthColor = 'bg-red-500';
                             if (healthScore >= 80) healthColor = 'bg-green-500';
                             else if (healthScore >= 50) healthColor = 'bg-yellow-500';

                             const levelColors = {
                                'Explorador': 'text-blue-600 bg-blue-50 border-blue-100',
                                'Activo': 'text-amber-600 bg-amber-50 border-amber-100',
                                'Embajador': 'text-purple-600 bg-purple-50 border-purple-100',
                             };
                             const levelStyle = levelColors[contact.level] || 'text-gray-600 bg-gray-50';

                             return (
                            <tr key={contact.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td className="px-6 py-4">
                                    <Link href={`/admin/crm/contacts/${contact.id}`} className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                           {contact.firstName[0]}{contact.lastName[0]}
                                        </div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                            {contact.firstName} {contact.lastName}
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3" />
                                        {contact.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {contact.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* Health Score Traffic Light */}
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${healthColor} shadow-sm animate-pulse`} />
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{healthScore}</span>
                                        <span className="text-xs text-muted-foreground">(Polinomio)</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${levelStyle}`}>
                                        {contact.level}
                                    </span>
                                </td>
                            </tr>
                        )})
                    )}
                </tbody>
            </table>
        </div>
    );
}
