"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ArrowRight, Trophy, PlayCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { SurveyModal } from "./SurveyModal";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
  points?: number;
}

// --- Configuración ---

/**
 * Mapeo de identificadores de pasos a IDs de formularios de Typeform.
 * Utiliza variables de entorno para evitar exponer IDs sensibles en el código fuente.
 */
const SURVEY_MAP: Record<string, string | undefined> = {
  "1": "wsUJblKO", // Encuesta Inicial (Updated)
  "3": process.env.NEXT_PUBLIC_TYPEFORM_SURVEY_POST,
  "4": process.env.NEXT_PUBLIC_TYPEFORM_SURVEY_3M,
  "5": process.env.NEXT_PUBLIC_TYPEFORM_SURVEY_6M,
};

/**
 * Estado inicial de los pasos del cronograma.
 * El primer paso se inicializa como 'current' para permitir la interacción inmediata.
 */
const INITIAL_STEPS: Step[] = [
  {
    id: "1",
    title: "Encuesta Inicial",
    description: "Evaluación del estado actual.",
    status: "current",
    date: "10 Oct",
    points: 50,
  },
  {
    id: "2",
    title: "Taller OASIS",
    description: "Jornada presencial de inmersión.",
    status: "upcoming",
    date: "12 Oct",
    points: 100,
  },
  {
    id: "3",
    title: "Encuesta Post Taller",
    description: "Reflexión y retroalimentación.",
    status: "upcoming",
    points: 75,
  },
  {
    id: "4",
    title: "Seguimiento 3 Meses",
    description: "Evaluación de impacto a medio plazo.",
    status: "upcoming",
    points: 50,
  },
  {
    id: "5",
    title: "Seguimiento 6 Meses",
    description: "Consolidación de hábitos a largo plazo.",
    status: "upcoming",
    points: 50,
  },
];

// --- Componente Principal ---

export function Timeline() {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  /**
   * Maneja la apertura del modal de encuesta.
   * Verifica si existe un formulario configurado para el paso seleccionado.
   */
  const handleStepClick = (stepId: string) => {
    // Open modal for any step click
    setActiveStepId(stepId);
  };

  /**
   * Actualiza el estado local de los pasos al completar una encuesta.
   * Marca el paso activo como 'completed'.
   */
  const handleSurveyCompletion = () => {
    if (!activeStepId) return;

    setSteps((currentSteps) =>
      currentSteps.map((step) => {
        if (step.id === activeStepId) {
          return { ...step, status: "completed" };
        }
        return step;
      })
    );
  };

  // Obtiene el ID del formulario actual para pasarlo al modal
  const currentFormId = activeStepId ? SURVEY_MAP[activeStepId] : "";

  return (
    <>
      <div className="relative space-y-8 p-4">
        {/* Línea conectora vertical */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200" />

        {steps.map((step) => {
          const hasSurveyConfigured = !!SURVEY_MAP[step.id];
          const isInteractable = true; // Allow interaction with all steps for the demo modal requirement 

          return (
            <div key={step.id} className="relative flex items-start gap-4 group">
              {/* Indicador de Estado (Icono circular) */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-aurora-cyan" />
                ) : step.status === "current" ? (
                  <div className="h-4 w-4 rounded-full bg-aurora-pink animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
              </div>

              {/* Tarjeta de Contenido */}
              <div
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "flex-1 rounded-2xl p-4 transition-all duration-300 border border-transparent",
                  step.status === "current"
                    ? "bg-white/80 shadow-md ring-1 ring-aurora-pink/50 scale-[1.02]"
                    : "bg-white/40 hover:bg-white/60",
                  isInteractable
                    ? "cursor-pointer hover:ring-2 hover:ring-aurora-cyan hover:shadow-lg"
                    : ""
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={cn(
                        "font-heading font-semibold text-lg",
                        step.status === "current" ? "text-gray-900" : "text-gray-600"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  </div>

                  {/* Metadatos: Fecha y Puntos */}
                  <div className="flex flex-col items-end gap-1">
                    {step.date && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {step.date}
                      </span>
                    )}
                    {step.points && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        +{step.points} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                {isInteractable && (
                  <div className="mt-4">
                    <button className="flex items-center gap-2 text-sm font-bold text-aurora-cyan hover:text-aurora-cyan-dark transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-aurora-cyan/20">
                      <PlayCircle className="h-4 w-4 fill-current" />
                      Comenzar Actividad
                    </button>
                  </div>
                )}

                {step.status === "current" && !hasSurveyConfigured && (
                  <div className="mt-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-aurora-pink hover:text-aurora-pink/80 transition-colors">
                      Ver detalles del evento <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Encuesta */}
      <SurveyModal
        isOpen={!!activeStepId}
        onClose={() => setActiveStepId(null)}
        onComplete={handleSurveyCompletion}
        formId={currentFormId || ""}
      />
    </>
  );
}