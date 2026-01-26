"use client";

import { Play, FileText, ArrowUpRight } from "lucide-react";

interface ResourceProps {
  type: "video" | "article" | "guide";
  title: string;
  duration?: string;
  image: string;
}

export function ResourceCard({ type, title, duration, image }: ResourceProps) {
  return (
    <div className="group relative w-48 h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/80" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
             <span className="inline-flex items-center justify-center p-2 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                {type === "video" ? <Play className="h-4 w-4 fill-white" /> : <FileText className="h-4 w-4" />}
             </span>
        </div>

        <div className="space-y-2">
            <h3 className="text-white font-heading font-bold text-lg leading-tight line-clamp-3">
                {title}
            </h3>
             <div className="flex items-center justify-between text-white/80 text-xs font-medium">
                {duration && <span>{duration}</span>}
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
      </div>
    </div>
  );
}
