"use client";

import { MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ForumBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#FF007F] text-white shadow-md relative z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/participant/community" className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer">
            <div className="bg-white/20 p-1.5 rounded-full shrink-0 animate-pulse">
                <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-xs md:text-sm truncate">
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-[10px] md:text-xs tracking-wider uppercase">Foro Activo</span>
                <span className="truncate">
                    <span className="font-bold text-yellow-300">Emanuel:</span> &quot;¡Gracias a todos los participantes en Antofagasta! 🙌✨ Fue increíble.&quot;
                </span>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="hover:bg-white/20 p-1 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-white/80 hover:text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
