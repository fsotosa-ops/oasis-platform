'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import {
  BookOpen,
  Clock,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle2,
  Play,
} from 'lucide-react';
import type { JourneyWithEnrollment, JourneyStatus } from '@/core/types';
import { cn } from '@/shared/lib/utils';

interface JourneyCardProps {
  journey: JourneyWithEnrollment;
  onEnroll?: (journeyId: string) => Promise<void>;
  isEnrolling?: boolean;
  variant?: 'default' | 'compact';
}

const statusConfig: Record<
  JourneyStatus,
  { label: string; className: string }
> = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
  active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archivado', className: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completado', className: 'bg-blue-100 text-blue-700' },
};

export function JourneyCard({
  journey,
  onEnroll,
  isEnrolling = false,
  variant = 'default',
}: JourneyCardProps) {
  const isCompact = variant === 'compact';
  const statusInfo = statusConfig[journey.status];
  const enrollmentStatus = journey.enrollment?.status;
  const isCompleted = enrollmentStatus === 'completed';
  const isInProgress = enrollmentStatus === 'in_progress' || enrollmentStatus === 'enrolled';

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEnroll) {
      await onEnroll(journey.id);
    }
  };

  return (
    <Link href={`/participant/journey/${journey.id}`}>
      <Card
        className={cn(
          'group relative overflow-hidden bg-white/70 backdrop-blur-sm border-gray-200/50 transition-all hover:shadow-lg hover:border-primary/20',
          isCompact ? 'flex flex-row' : 'flex flex-col'
        )}
      >
        {/* Cover Image */}
        <div
          className={cn(
            'relative overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5',
            isCompact ? 'w-32 h-full min-h-[120px]' : 'h-40'
          )}
        >
          {journey.cover_image_url ? (
            <img
              src={journey.cover_image_url}
              alt={journey.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/30" />
            </div>
          )}

          {/* Status badge - overlay */}
          <div className="absolute top-2 right-2">
            <Badge className={cn('text-xs', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Completed overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-white rounded-full p-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <CardContent className={cn('flex-1', isCompact ? 'py-3' : 'pt-4')}>
            {/* Title */}
            <h3
              className={cn(
                'font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2',
                isCompact ? 'text-sm' : 'text-lg'
              )}
            >
              {journey.title}
            </h3>

            {/* Description */}
            {journey.description && !isCompact && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {journey.description}
              </p>
            )}

            {/* Stats */}
            <div
              className={cn(
                'flex items-center gap-4 text-sm text-muted-foreground',
                isCompact ? 'mt-2' : 'mt-4'
              )}
            >
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{journey.total_steps} pasos</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>{journey.total_points} pts</span>
              </div>
            </div>

            {/* Progress bar for enrolled journeys */}
            {journey.enrollment && !isCompact && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {journey.enrollment.completed_steps} de{' '}
                    {journey.enrollment.total_steps} completados
                  </span>
                  <span>{journey.enrollment.progress}%</span>
                </div>
                <ProgressBar
                  value={journey.enrollment.progress}
                  size="sm"
                  variant={isCompleted ? 'success' : 'default'}
                />
              </div>
            )}
          </CardContent>

          {/* Footer with action button */}
          {!isCompact && (
            <CardFooter className="pt-0">
              {!journey.isEnrolled && journey.status === 'active' ? (
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Play className="h-4 w-4" />
                  {isEnrolling ? 'Inscribiendo...' : 'Inscribirse'}
                </Button>
              ) : journey.isEnrolled ? (
                <Button className="w-full gap-2" variant="default">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Ver Certificado
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button className="w-full" variant="ghost" disabled>
                  No disponible
                </Button>
              )}
            </CardFooter>
          )}
        </div>
      </Card>
    </Link>
  );
}

interface JourneyCardSkeletonProps {
  variant?: 'default' | 'compact';
}

export function JourneyCardSkeleton({ variant = 'default' }: JourneyCardSkeletonProps) {
  const isCompact = variant === 'compact';

  return (
    <Card
      className={cn(
        'overflow-hidden bg-white/70 backdrop-blur-sm border-gray-200/50',
        isCompact ? 'flex flex-row' : 'flex flex-col'
      )}
    >
      <div
        className={cn(
          'bg-muted animate-pulse',
          isCompact ? 'w-32 h-[120px]' : 'h-40'
        )}
      />
      <div className="flex-1 p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        {!isCompact && (
          <>
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </>
        )}
        <div className="flex gap-4">
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>
      </div>
    </Card>
  );
}
