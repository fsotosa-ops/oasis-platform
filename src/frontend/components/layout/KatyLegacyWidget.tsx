
import React, { useState } from 'react';
import { Music, Pause, Play, Heart } from 'lucide-react';
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { cn } from "@/frontend/lib/utils";

export const KatyLegacyWidget = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showList, setShowList] = useState(false);

    const songs = [
        { title: "Roar (Piano Version)", artist: "Katy P.", duration: "4:30" },
        { title: "Firework (Acoustic)", artist: "Katy P.", duration: "3:45" },
        { title: "Unconditionally", artist: "Katy P.", duration: "3:50" },
        { title: "Part of Me (Ballad)", artist: "Katy P.", duration: "4:00" },
    ];

    return (
        <Card className="w-full bg-linear-to-b from-gray-900 to-black text-white border-0 shadow-xl overflow-hidden mt-6">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Music className="w-16 h-16 transform rotate-12" />
            </div>
            
            <CardContent className="px-3 py-2 relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                    <Heart className="w-3 h-3 text-[#FF007F] fill-[#FF007F] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFFF00]">El Legado de Katy</span>
                </div>
                
                <h4 className="font-heading font-semibold text-gray-100 text-sm mb-1 leading-tight">
                    Canciones que iluminan
                </h4>

                {/* Song List (Expandable) */}
                <div className={cn(
                    "overflow-hidden transition-all duration-300 space-y-2 mb-2",
                    showList ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}>
                    {songs.map((song, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-white/10 cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <Play className="w-2 h-2 text-[#FF007F] group-hover:text-[#DFFF00] transition-colors" />
                                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{song.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{song.duration}</span>
                        </div>
                    ))}
                    <div className="pt-2 text-center">
                         <Button variant="link" size="sm" className="text-[10px] h-auto p-0 text-indigo-500">
                            Ver todas en Spotify
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="default" 
                        className={cn(
                            "flex-1 h-8 text-xs gap-2 font-bold transition-all border-0",
                            isPlaying 
                                ? "bg-[#FF007F] text-black hover:bg-[#FF007F]/90" 
                                : "bg-[#DFFF00] text-black hover:bg-[#DFFF00]/90"
                        )}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black" />}
                        {isPlaying ? "Pausar" : "Escuchar"}
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 px-2 text-[10px] text-[#DFFF00] hover:text-[#DFFF00] hover:bg-white/10"
                        onClick={() => setShowList(!showList)}
                    >
                        {showList ? "Ocultar" : "Ver más ▼"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
