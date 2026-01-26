'use client';

import React from 'react';
import { Card, CardContent } from '@/frontend/components/ui/card';
import { Button } from '@/frontend/components/ui/button';
import { Instagram, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const InstagramFeedWidget = () => {
    // Mock Data for Feed
    const posts = [
        { id: 1, image: 'bg-indigo-200', likes: 124, comments: 12, caption: '¡Gran jornada en el taller de hoy! 🌞 #FundacionSummer' },
        { id: 2, image: 'bg-purple-200', likes: 89, comments: 5, caption: 'Construyendo comunidad paso a paso. 🤝' },
        { id: 3, image: 'bg-pink-200', likes: 256, comments: 34, caption: 'Gracias a todos por participar. ✨' },
    ];

    return (
        <Card className="mt-4 mx-2 overflow-hidden border-0 shadow-md shadow-indigo-100/50 dark:shadow-none bg-white dark:bg-zinc-950/50 backdrop-blur-sm group hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100 dark:ring-zinc-800">
             {/* Gradient Accent Header */}
             <div className="h-1 w-full bg-linear-to-r from-fuchsia-500 via-purple-500 to-indigo-600 opacity-80" />
             
             <div className="p-3 flex justify-between items-center bg-white dark:bg-transparent">
                <div className="flex items-center gap-2">
                    <div className="p-0.5 rounded-full bg-linear-to-tr from-fuchsia-400 via-purple-500 to-indigo-500">
                        <div className="p-0.5 bg-white dark:bg-zinc-950 rounded-full">
                            <Instagram className="w-3 h-3 text-fuchsia-600 dark:text-fuchsia-400" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-[10px] tracking-tight text-gray-900 dark:text-gray-100 leading-none">Fundación Summer</span>
                        <span className="text-[9px] text-muted-foreground leading-none">@fundacionsummer</span>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-5 text-[9px] px-2 rounded-full border-gray-200 dark:border-zinc-800 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors" asChild>
                    <Link href="https://instagram.com/fundacionsummer" target="_blank">
                        Seguir
                    </Link>
                </Button>
            </div>

            <CardContent className="p-0">
                <div className="grid grid-cols-3 gap-0.5 px-3 pb-3">
                    {posts.map((post) => (
                        <Link href="https://instagram.com/fundacionsummer" target="_blank" key={post.id} className="aspect-square relative group/image cursor-pointer overflow-hidden rounded-sm">
                             <div className={`w-full h-full ${post.image} group-hover/image:scale-110 transition-transform duration-700 ease-out`} />
                             
                             {/* Overlay */}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="flex items-center gap-0.5 text-white text-[9px] font-medium backdrop-blur-md px-1.5 py-0.5 rounded-full bg-black/10">
                                    <Heart className="w-2.5 h-2.5 fill-white/90" /> {post.likes}
                                </div>
                             </div>
                        </Link>
                    ))}
                </div>
                
                <div className="px-3 pb-2 pt-0 flex justify-center">
                    <Link href="https://instagram.com" target="_blank" className="flex items-center text-[9px] text-muted-foreground hover:text-fuchsia-500 transition-colors gap-1 group/link">
                        <span>Ver últimas novedades</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-50 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
