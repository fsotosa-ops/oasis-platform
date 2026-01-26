"use client";

import { Avatar, AvatarFallback } from "@/frontend/components/ui/avatar";
import { Button } from "@/frontend/components/ui/button";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Heart, MessageSquare, Share2, Image as ImageIcon, Smile } from "lucide-react";
import { useState } from "react";

const posts = [
  {
    id: 1,
    author: "María G.",
    role: "Participante",
    content: "Hoy apliqué la técnica de 'Escucha Activa' con mi equipo. ¡La diferencia fue increíble! Se sintieron mucho más validados.",
    image: null,
    likes: 12,
    comments: 4,
    time: "2h",
    initial: "MG",
    topComment: {
        author: "Coach Ana",
        text: "¡Excelente María! Ese es el primer paso para el liderazgo consciente. 👏",
        likes: 3
    }
  },
  {
    id: 2,
    author: "Admin OASIS",
    role: "Mentor",
    content: "Recordatorio: Mañana tenemos sesión de seguimiento. Traigan sus dudas sobre el módulo de Empatía.",
    image: "/placeholder_meeting.jpg", // Simulated image
    likes: 24,
    comments: 8,
    time: "5h",
    initial: "AO",
    topComment: null
  }
];

export function CommunityFeed() {
    const [newPost, setNewPost] = useState("");

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Create Post Widget */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-orange-100 dark:border-zinc-800 space-y-4">
                <div className="flex gap-4">
                     <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">YO</AvatarFallback>
                    </Avatar>
                    <Textarea 
                        placeholder="Comparte tu experiencia, fotos o haz una pregunta a la comunidad..." 
                        value={newPost}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost(e.target.value)}
                        className="min-h-[80px] border-none bg-gray-50 dark:bg-zinc-800/50 focus:ring-0 resize-none font-medium text-sm rounded-xl p-3"
                    />
                </div>
                <div className="flex justify-between items-center pl-14">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full h-8 w-8">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full h-8 w-8">
                            <Smile className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button disabled={!newPost.trim()} className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 h-8 text-xs font-semibold">
                        Publicar
                    </Button>
                </div>
            </div>

            {/* Feed Stream */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                        {/* Post Header */}
                        <div className="p-5 flex gap-3 pb-3">
                            <Avatar>
                                <AvatarFallback className="bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold border-2 border-white shadow-sm ring-1 ring-indigo-50">{post.initial}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{post.author}</h4>
                                        <span className="text-[10px] text-indigo-500 font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mt-0.5 inline-block">
                                            {post.role}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{post.time}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Post Content */}
                        <div className="px-5 pb-2">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                         {/* Mock Image Attachment */}
                         {post.image && (
                            <div className="mt-3 mx-5 rounded-xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center text-gray-400 border border-gray-100 relative group cursor-pointer">
                                <ImageIcon className="h-8 w-8 opacity-20" />
                                <span className="absolute bottom-2 right-2 text-[10px] bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur-sm">Simulación de Foto</span>
                            </div>
                        )}

                        {/* Top Comment (Popular) */}
                        {post.topComment && (
                            <div className="mx-5 mb-4 mt-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl relative">
                                <span className="absolute -top-2 left-6 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold border border-white shadow-sm">
                                    🔥 Destacado
                                </span>
                                <div className="flex gap-2">
                                     <div className="w-0.5 bg-amber-200 rounded-full self-stretch" />
                                     <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{post.topComment.author}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{post.topComment.text}</p>
                                     </div>
                                </div>
                            </div>
                        )}

                        {/* Interactions */}
                        <div className="px-5 py-3 border-t border-gray-50 dark:border-zinc-800 mt-2 flex justify-between items-center">
                            <div className="flex gap-4">
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-red-500 hover:bg-red-50 gap-1.5 rounded-full group">
                                    <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" /> 
                                    <span className="text-xs font-medium">{post.likes}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 gap-1.5 rounded-full">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-xs font-medium">{post.comments}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-green-500 hover:bg-green-50 gap-1.5 rounded-full">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
