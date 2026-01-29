'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
  Enrollment,
  EnrollmentWithJourney,
  JourneyStep,
  StepCompletion,
} from '@/core/types';

interface EnrollmentProgress {
  enrollment: Enrollment;
  steps: JourneyStep[];
  completions: StepCompletion[];
  completedStepIds: Set<string>;
}

interface UseEnrollmentReturn {
  enrollments: EnrollmentWithJourney[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  enroll: (journeyId: string) => Promise<Enrollment>;
  drop: (enrollmentId: string) => Promise<void>;
}

export function useEnrollments(): UseEnrollmentReturn {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchEnrollments = useCallback(async () => {
    if (!profile) {
      setEnrollments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select(`
          *,
          journey:journeys (
            id,
            organization_id,
            title,
            description,
            cover_image_url,
            status,
            settings,
            total_steps,
            total_points,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', profile.id)
        .order('enrolled_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedData: EnrollmentWithJourney[] = (data || [])
        .map((item) => {
          const journeyData = Array.isArray(item.journey)
            ? item.journey[0]
            : item.journey;

          if (!journeyData) return null;

          return {
            id: item.id,
            journey_id: item.journey_id,
            user_id: item.user_id,
            status: item.status,
            progress: item.progress || 0,
            completed_steps: item.completed_steps || 0,
            total_steps: item.total_steps || journeyData.total_steps || 0,
            points_earned: item.points_earned || 0,
            enrolled_at: item.enrolled_at,
            completed_at: item.completed_at,
            journey: journeyData,
          } as EnrollmentWithJourney;
        })
        .filter((e): e is EnrollmentWithJourney => e !== null);

      setEnrollments(transformedData);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar inscripciones');
    } finally {
      setIsLoading(false);
    }
  }, [profile, supabase]);

  const enroll = useCallback(
    async (journeyId: string): Promise<Enrollment> => {
      if (!profile) {
        throw new Error('No hay sesión activa');
      }

      // Get journey to get total steps
      const { data: journey, error: journeyError } = await supabase
        .from('journeys')
        .select('total_steps')
        .eq('id', journeyId)
        .single();

      if (journeyError) throw journeyError;

      const { data, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          journey_id: journeyId,
          user_id: profile.id,
          status: 'enrolled',
          progress: 0,
          completed_steps: 0,
          total_steps: journey?.total_steps || 0,
          points_earned: 0,
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

      await fetchEnrollments();
      return data as Enrollment;
    },
    [profile, supabase, fetchEnrollments]
  );

  const drop = useCallback(
    async (enrollmentId: string): Promise<void> => {
      const { error: dropError } = await supabase
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('id', enrollmentId);

      if (dropError) throw dropError;

      await fetchEnrollments();
    },
    [supabase, fetchEnrollments]
  );

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    isLoading,
    error,
    refresh: fetchEnrollments,
    enroll,
    drop,
  };
}

/**
 * Hook for managing a specific enrollment's progress
 */
export function useEnrollmentProgress(enrollmentId: string) {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProgress = useCallback(async () => {
    if (!enrollmentId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single();

      if (enrollmentError) throw enrollmentError;

      // Get journey steps
      const { data: steps, error: stepsError } = await supabase
        .from('journey_steps')
        .select('*')
        .eq('journey_id', enrollment.journey_id)
        .order('order', { ascending: true });

      if (stepsError) throw stepsError;

      // Get completions
      const { data: completions, error: completionsError } = await supabase
        .from('step_completions')
        .select('*')
        .eq('enrollment_id', enrollmentId);

      if (completionsError) throw completionsError;

      const completedStepIds = new Set(
        (completions || []).map((c) => c.step_id)
      );

      setProgress({
        enrollment: enrollment as Enrollment,
        steps: (steps || []) as JourneyStep[],
        completions: (completions || []) as StepCompletion[],
        completedStepIds,
      });
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar progreso');
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId, supabase]);

  const completeStep = useCallback(
    async (stepId: string, submissionData?: Record<string, unknown>) => {
      if (!progress) throw new Error('No hay progreso cargado');

      const step = progress.steps.find((s) => s.id === stepId);
      if (!step) throw new Error('Paso no encontrado');

      // Check if already completed
      if (progress.completedStepIds.has(stepId)) {
        return; // Already completed
      }

      // Create completion record
      const { data: completion, error: completionError } = await supabase
        .from('step_completions')
        .insert({
          enrollment_id: enrollmentId,
          step_id: stepId,
          points_awarded: step.points,
          submission_data: submissionData || {},
        })
        .select()
        .single();

      if (completionError) throw completionError;

      // Update enrollment progress
      const newCompletedSteps = progress.enrollment.completed_steps + 1;
      const newProgress = Math.round(
        (newCompletedSteps / progress.steps.length) * 100
      );
      const newPointsEarned = progress.enrollment.points_earned + step.points;

      const isCompleted = newCompletedSteps === progress.steps.length;

      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          completed_steps: newCompletedSteps,
          progress: newProgress,
          points_earned: newPointsEarned,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      await fetchProgress();
      return completion as StepCompletion;
    },
    [progress, enrollmentId, supabase, fetchProgress]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refresh: fetchProgress,
    completeStep,
    isStepCompleted: (stepId: string) =>
      progress?.completedStepIds.has(stepId) || false,
  };
}
