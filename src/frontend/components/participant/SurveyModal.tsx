"use client";

import { Dialog, DialogContent, DialogTitle } from "@/frontend/components/ui/dialog";
import { Widget } from "@typeform/embed-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void; // <--- NUEVA PROPIEDAD
  formId: string;
  userId?: string;
}

export function SurveyModal({ isOpen, onClose, onComplete, formId, userId }: SurveyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Encuesta de Bienestar</DialogTitle>
        </VisuallyHidden>

        <div className="w-full h-full relative">
          {formId ? (
            <Widget
                id={formId}
                style={{ width: "100%", height: "100%" }}
                className="w-full h-full"
                onSubmit={() => {
                console.log("Encuesta completada");
                onComplete(); // <--- AVISAMOS AL PADRE QUE SE COMPLETÓ
                setTimeout(() => onClose(), 2000); // Cerramos tras 2 segundos
                }}
                hidden={{
                user_id: userId || "anonimo",
                source: "portal_timeline",
                }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-aurora-cyan/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-3xl">📅</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Detalles del Evento</h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Este evento es una oportunidad única para conectar con la comunidad. 
                        Más información pronto.
                    </p>
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}