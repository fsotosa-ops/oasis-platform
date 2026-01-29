'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useJourneyDetails } from '@/features/journey/hooks/useJourneys';
import { useEnrollments, useEnrollmentProgress } from '@/features/journey/hooks/useEnrollment';
import { JourneyTimeline } from '@/features/journey/components/JourneyTimeline';
import { ProgressBar } from '@/features/journey/components/ProgressBar';
import { PointsBadge } from '@/features/gamification/components/PointsBadge';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import type { JourneyStep } from '@/core/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JourneyDetailPage({ params }: PageProps) {
  const { id: journeyId } = use(params);
  const router = useRouter();
  const { profile } = useAuth();
  const { journey, isLoading: journeyLoading, error: journeyError } = useJourneyDetails(journeyId);
  const { enroll } = useEnrollments();
  const { progress, isLoading: progressLoading, completeStep, refresh: refreshProgress } =
    useEnrollmentProgress(journey?.enrollment?.id || '');

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const isLoading = journeyLoading;

  const handleEnroll = async () => {
    if (!journeyId) return;

    setEnrollError(null);
    setIsEnrolling(true);
    try {
      await enroll(journeyId);
      // Refresh the page to get updated enrollment
      window.location.reload();
    } catch (err) {
      setEnrollError(
        err instanceof Error ? err.message : 'Error al inscribirse'
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStepComplete = async (step: JourneyStep) => {
    setStepError(null);
    setCompletingStepId(step.id);
    try {
      await completeStep(step.id);
    } catch (err) {
      setStepError(
        err instanceof Error ? err.message : 'Error al completar el paso'
      );
    } finally {
      setCompletingStepId(null);
    }
  };

  const handleStepStart = (step: JourneyStep) => {
    // Navigate to step detail or open modal based on step type
    console.log('Starting step:', step);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (journeyError || !journey) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {journeyError || 'Journey no encontrado'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isEnrolled = journey.isEnrolled;
  const enrollment = journey.enrollment;
  const isCompleted = enrollment?.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Journeys
      </Button>

      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-gray-200/50">
        {journey.cover_image_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${journey.cover_image_url})` }}
          />
        )}
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={
                    journey.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }
                >
                  {journey.status === 'active' ? 'Activo' : journey.status}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {journey.title}
              </h1>
              {journey.description && (
                <p className="mt-2 text-gray-600 max-w-2xl">
                  {journey.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{journey.total_steps} pasos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{journey.total_points} puntos</span>
                </div>
                {enrollment && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Inscrito el{' '}
                      {new Date(enrollment.enrolled_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="flex-shrink-0">
              {!isEnrolled ? (
                <Button
                  size="lg"
                  onClick={handleEnroll}
                  disabled={isEnrolling || journey.status !== 'active'}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscribiendo...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Inscribirse
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-right">
                  <PointsBadge
                    points={enrollment?.points_earned || 0}
                    size="lg"
                    variant="gold"
                  />
                  {enrollment && (
                    <p className="text-sm text-gray-500 mt-2">
                      {enrollment.completed_steps} de {enrollment.total_steps}{' '}
                      completados
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enrollment error */}
          {enrollError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{enrollError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Main content */}
      {isEnrolled && progress ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Timeline */}
          <div>
            {stepError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{stepError}</AlertDescription>
              </Alert>
            )}
            <JourneyTimeline
              steps={progress.steps}
              completedStepIds={progress.completedStepIds}
              enrollment={progress.enrollment}
              onStepStart={handleStepStart}
              onStepComplete={handleStepComplete}
              isLoading={progressLoading}
              loadingStepId={completingStepId}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick stats */}
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso general</span>
                    <span className="font-medium">
                      {progress.enrollment.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={progress.enrollment.progress}
                    variant={isCompleted ? 'success' : 'default'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completados</span>
                    <p className="text-lg font-semibold">
                      {progress.enrollment.completed_steps}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pendientes</span>
                    <p className="text-lg font-semibold">
                      {progress.steps.length - progress.enrollment.completed_steps}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : !isEnrolled ? (
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">
              Inscríbete para comenzar
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Una vez inscrito, podrás ver los pasos del journey y comenzar tu
              aprendizaje.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
