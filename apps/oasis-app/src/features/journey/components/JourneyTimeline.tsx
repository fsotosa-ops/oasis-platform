'use client';

import React from 'react';
import { StepCard, StepCardSkeleton } from './StepCard';
import { ProgressBar, CircularProgress } from './ProgressBar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Trophy, Target, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import type { JourneyStep, Enrollment } from '@/core/types';
import { cn } from '@/shared/lib/utils';

interface JourneyTimelineProps {
  steps: JourneyStep[];
  completedStepIds: Set<string>;
  enrollment?: Enrollment;
  onStepStart?: (step: JourneyStep) => void;
  onStepComplete?: (step: JourneyStep) => Promise<void>;
  isLoading?: boolean;
  loadingStepId?: string | null;
}

export function JourneyTimeline({
  steps,
  completedStepIds,
  enrollment,
  onStepStart,
  onStepComplete,
  isLoading = false,
  loadingStepId = null,
}: JourneyTimelineProps) {
  const completedCount = completedStepIds.size;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Calculate points
  const totalPoints = steps.reduce((sum, step) => sum + step.points, 0);
  const earnedPoints = steps
    .filter((step) => completedStepIds.has(step.id))
    .reduce((sum, step) => sum + step.points, 0);

  // Determine which steps are locked (must complete required steps in order)
  const getStepLockStatus = (stepIndex: number): boolean => {
    // Check if any previous required steps are not completed
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = steps[i];
      if (prevStep.is_required && !completedStepIds.has(prevStep.id)) {
        return true;
      }
    }
    return false;
  };

  // Find the current active step (first incomplete non-locked step)
  const activeStepIndex = steps.findIndex(
    (step, index) =>
      !completedStepIds.has(step.id) && !getStepLockStatus(index)
  );

  if (isLoading && steps.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3 mb-4" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
          </CardContent>
        </Card>
        {[1, 2, 3].map((i) => (
          <StepCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress summary card */}
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tu Progreso</CardTitle>
          <CardDescription>
            {completedCount === totalSteps
              ? 'Has completado todos los pasos.'
              : `${completedCount} de ${totalSteps} pasos completados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* Circular progress */}
            <CircularProgress
              value={progress}
              size={80}
              strokeWidth={6}
              variant={progress === 100 ? 'success' : 'default'}
            />

            {/* Stats */}
            <div className="flex-1 space-y-4">
              <ProgressBar
                value={progress}
                size="md"
                variant={progress === 100 ? 'success' : 'default'}
              />

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Pasos:</span>
                  <span className="font-medium">
                    {completedCount}/{totalSteps}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Puntos:</span>
                  <span className="font-medium">
                    {earnedPoints}/{totalPoints}
                  </span>
                </div>
                {enrollment && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Inscrito:</span>
                    <span className="font-medium">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completion badge */}
          {progress === 100 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-700">
                  Journey Completado
                </p>
                <p className="text-sm text-green-600">
                  Ganaste {earnedPoints} puntos
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline of steps */}
      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-[2px]" />

        <div className="space-y-4 pl-4">
          {steps.map((step, index) => {
            const isCompleted = completedStepIds.has(step.id);
            const isLocked = getStepLockStatus(index);
            const isActive = index === activeStepIndex;
            const isStepLoading = loadingStepId === step.id;

            return (
              <StepCard
                key={step.id}
                step={step}
                stepNumber={index + 1}
                isCompleted={isCompleted}
                isLocked={isLocked}
                isActive={isActive}
                onStart={() => onStepStart?.(step)}
                onComplete={
                  onStepComplete ? () => onStepComplete(step) : undefined
                }
                isLoading={isStepLoading}
              />
            );
          })}
        </div>
      </div>

      {steps.length === 0 && !isLoading && (
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              No hay pasos en este journey
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              El contenido estará disponible pronto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
