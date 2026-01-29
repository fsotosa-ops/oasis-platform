'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  FileText,
  HelpCircle,
  ClipboardList,
  FormInput,
  Video,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  Play,
  Trophy,
  Loader2,
} from 'lucide-react';
import type { JourneyStep, StepType } from '@/core/types';
import { cn } from '@/shared/lib/utils';

interface StepCardProps {
  step: JourneyStep;
  stepNumber: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isActive?: boolean;
  onStart?: () => void;
  onComplete?: () => Promise<void>;
  isLoading?: boolean;
}

const stepTypeConfig: Record<
  StepType,
  { icon: React.ElementType; label: string; color: string }
> = {
  content: {
    icon: FileText,
    label: 'Contenido',
    color: 'text-blue-500 bg-blue-100',
  },
  quiz: {
    icon: HelpCircle,
    label: 'Quiz',
    color: 'text-purple-500 bg-purple-100',
  },
  task: {
    icon: ClipboardList,
    label: 'Tarea',
    color: 'text-orange-500 bg-orange-100',
  },
  typeform: {
    icon: FormInput,
    label: 'Formulario',
    color: 'text-pink-500 bg-pink-100',
  },
  video: {
    icon: Video,
    label: 'Video',
    color: 'text-red-500 bg-red-100',
  },
  link: {
    icon: LinkIcon,
    label: 'Enlace',
    color: 'text-green-500 bg-green-100',
  },
};

export function StepCard({
  step,
  stepNumber,
  isCompleted = false,
  isLocked = false,
  isActive = false,
  onStart,
  onComplete,
  isLoading = false,
}: StepCardProps) {
  const typeConfig = stepTypeConfig[step.type];
  const StepIcon = typeConfig.icon;

  const handleAction = async () => {
    if (isLocked || isLoading) return;

    if (isCompleted) {
      // View step content
      onStart?.();
    } else if (onComplete) {
      await onComplete();
    } else {
      onStart?.();
    }
  };

  return (
    <Card
      className={cn(
        'relative transition-all',
        isCompleted && 'bg-green-50/50 border-green-200',
        isActive && 'ring-2 ring-primary ring-offset-2',
        isLocked && 'opacity-60 cursor-not-allowed',
        !isLocked && !isCompleted && 'hover:shadow-md hover:border-primary/30'
      )}
    >
      {/* Step number indicator */}
      <div
        className={cn(
          'absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
          isCompleted
            ? 'bg-green-500 text-white'
            : isLocked
              ? 'bg-gray-300 text-gray-500'
              : 'bg-primary text-white'
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : isLocked ? (
          <Lock className="h-3 w-3" />
        ) : (
          stepNumber
        )}
      </div>

      <CardHeader className="pb-2 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', typeConfig.color)}
              >
                <StepIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
              {step.is_required && (
                <Badge variant="outline" className="text-xs">
                  Obligatorio
                </Badge>
              )}
            </div>
            <CardTitle className="text-base">{step.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>{step.points}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pl-6">
        {step.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {step.description}
          </p>
        )}

        {/* Action button */}
        {!isLocked && (
          <Button
            onClick={handleAction}
            disabled={isLoading}
            variant={isCompleted ? 'ghost' : 'default'}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completado
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Comenzar
              </>
            )}
          </Button>
        )}

        {isLocked && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Completa los pasos anteriores para desbloquear</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StepCardSkeleton() {
  return (
    <Card className="relative">
      <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-muted animate-pulse" />
      <CardHeader className="pb-2 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded animate-pulse w-20" />
            <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
          </div>
          <div className="h-5 bg-muted rounded animate-pulse w-12" />
        </div>
      </CardHeader>
      <CardContent className="pl-6">
        <div className="h-4 bg-muted rounded animate-pulse w-full mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-4" />
        <div className="h-9 bg-muted rounded animate-pulse w-28" />
      </CardContent>
    </Card>
  );
}
