"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { ScrollArea } from "@/frontend/components/ui/scroll-area";
import { X, Send, Sparkles, Brain, Bot } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export function OASISChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"mentor" | "coach">("mentor");
  const [showTooltip, setShowTooltip] = useState(true);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: { mode },
    onError: (e: Error) => {
        console.error("Chatbot Error:", e);
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Throttled auto-scroll - only scroll when new messages arrive, not during streaming
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, []);

  useEffect(() => {
    // Only auto-scroll when a new message is added, not during content updates
    if (messages.length > lastMessageCountRef.current) {
      scrollToBottom();
      lastMessageCountRef.current = messages.length;
    }
  }, [messages.length, scrollToBottom]);

  // Hide tooltip after 8 seconds or when chat is opened
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[400px] h-[650px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-5 flex items-center justify-between ${
                mode === 'mentor' ? 'bg-linear-to-r from-aurora-cyan/30 to-aurora-cyan/10' : 'bg-linear-to-r from-aurora-pink/30 to-aurora-pink/10'
            }`}>
              <div className="flex items-center gap-4">
                 <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg ${
                     mode === 'mentor' ? 'bg-linear-to-br from-aurora-cyan to-teal-500 text-white' : 'bg-linear-to-br from-aurora-pink to-rose-500 text-white'
                 }`}>
                    {mode === 'mentor' ? <Sparkles className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                 </div>
                 <div>
                    <h3 className="font-heading font-bold text-lg text-gray-800">OASIS AI</h3>
                    <div className="flex gap-2 text-sm font-medium">
                        <button 
                            onClick={() => setMode("mentor")}
                            className={`px-3 py-1 rounded-full transition-all ${
                                mode === 'mentor' ? 'bg-white shadow-sm text-aurora-cyan font-semibold' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            🌟 Mentor
                        </button>
                        <button 
                             onClick={() => setMode("coach")}
                             className={`px-3 py-1 rounded-full transition-all ${
                                mode === 'coach' ? 'bg-white shadow-sm text-aurora-pink font-semibold' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            🎯 Coach
                        </button>
                    </div>
                 </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/50">
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${
                            mode === 'mentor' ? 'bg-aurora-cyan/20' : 'bg-aurora-pink/20'
                        }`}>
                            {mode === 'mentor' ? (
                                <Sparkles className="h-10 w-10 text-aurora-cyan" />
                            ) : (
                                <Brain className="h-10 w-10 text-aurora-pink" />
                            )}
                        </div>
                        <h4 className="font-heading font-semibold text-lg text-gray-800 mb-2">
                            {mode === 'mentor' ? '¡Hola! Soy tu Mentor' : '¡Hola! Soy tu Coach'}
                        </h4>
                        <p className="text-gray-500 text-sm max-w-xs">
                            {mode === 'mentor' 
                                ? 'Estoy aquí para escucharte y apoyarte en tu bienestar emocional. ¿Cómo te sientes hoy?' 
                                : 'Transformemos intenciones en acciones concretas. ¿Qué objetivo quieres conquistar?'
                            }
                        </p>
                    </div>
                )}
                <div className="space-y-4">
                    {messages.map((m: { id: string; role: string; content: string }) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                                m.role === 'user' 
                                    ? "bg-gray-900 text-white rounded-br-none" 
                                    : "bg-white border border-gray-100 shadow-md rounded-bl-none text-gray-700"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white border border-gray-100 shadow-md rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5">
                                <span className="w-2.5 h-2.5 bg-aurora-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2.5 h-2.5 bg-aurora-pink rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2.5 h-2.5 bg-aurora-yellow rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                             </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="mx-4 mt-2 mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
                        <span className="shrink-0">⚠️</span>
                        <span>{error.message || "Ocurrió un error. Intenta de nuevo."}</span>
                    </div>
                )}
            </ScrollArea>

            {/* Input - Fixed at bottom */}
            <div className="p-4 bg-white/80 border-t border-gray-100 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input 
                        value={input} 
                        onChange={handleInputChange} 
                        placeholder={mode === 'mentor' ? "Cuéntame cómo te sientes..." : "¿Cuál es tu próximo objetivo?"}
                        className="rounded-full bg-white border-gray-200 shadow-sm focus-visible:ring-2 focus-visible:ring-aurora-cyan"
                        autoComplete="off"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={isLoading}
                        className={cn(
                        "rounded-full shrink-0 transition-all shadow-md h-10 w-10",
                         mode === 'mentor' ? 'bg-linear-to-br from-aurora-cyan to-teal-500 hover:from-aurora-cyan/80 hover:to-teal-500/80' : 'bg-linear-to-br from-aurora-pink to-rose-500 hover:from-aurora-pink/80 hover:to-rose-500/80',
                         isLoading && "opacity-50 cursor-not-allowed"
                    )}>
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-xl p-4 w-64 border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-aurora-cyan to-aurora-pink flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">¡Hola! Soy OASIS AI</p>
                <p className="text-xs text-gray-500 mt-1">Tu asistente de bienestar mental. Haz clic para conversar.</p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Button - More Prominent */}
      <motion.button
        onClick={handleOpenChat}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "h-20 w-20 rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden",
          "bg-linear-to-br from-aurora-cyan via-aurora-pink to-aurora-yellow",
          "ring-4 ring-white/50"
        )}
      >
        {/* Pulsing animation */}
        <motion.div
          className="absolute inset-0 bg-linear-to-br from-aurora-cyan via-aurora-pink to-aurora-yellow rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative z-10 flex flex-col items-center">
          <Bot className="h-8 w-8 text-white drop-shadow-md" />
          <span className="text-[10px] font-bold text-white mt-0.5 drop-shadow-md">AI</span>
        </div>
      </motion.button>
    </div>
  );
}
