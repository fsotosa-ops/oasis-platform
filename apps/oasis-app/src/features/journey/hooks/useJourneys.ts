'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
  Journey,
  JourneyWithEnrollment,
  Enrollment,
  JourneyStatus,
} from '@/core/types';

interface UseJourneysReturn {
  journeys: JourneyWithEnrollment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getJourneyById: (id: string) => JourneyWithEnrollment | undefined;
}

interface UseJourneysOptions {
  status?: JourneyStatus;
  onlyEnrolled?: boolean;
}

export function useJourneys(options: UseJourneysOptions = {}): UseJourneysReturn {
  const { currentOrg, profile } = useAuth();
  const [journeys, setJourneys] = useState<JourneyWithEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchJourneys = useCallback(async () => {
    if (!currentOrg) {
      setJourneys([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query for journeys
      let query = supabase
        .from('journeys')
        .select('*')
        .eq('organization_id', currentOrg.data.id)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data: journeysData, error: journeysError } = await query;

      if (journeysError) throw journeysError;

      // Get enrollments for current user
      let enrollmentsMap: Map<string, Enrollment> = new Map();

      if (profile) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', profile.id);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
        } else if (enrollmentsData) {
          enrollmentsMap = new Map(
            enrollmentsData.map((e) => [e.journey_id, e as Enrollment])
          );
        }
      }

      // Combine journeys with enrollment status
      let combinedJourneys: JourneyWithEnrollment[] = (journeysData || []).map(
        (journey) => {
          const enrollment = enrollmentsMap.get(journey.id);
          return {
            ...(journey as Journey),
            enrollment,
            isEnrolled: !!enrollment,
          };
        }
      );

      // Filter to only enrolled if requested
      if (options.onlyEnrolled) {
        combinedJourneys = combinedJourneys.filter((j) => j.isEnrolled);
      }

      setJourneys(combinedJourneys);
    } catch (err) {
      console.error('Error fetching journeys:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar journeys');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, profile, supabase, options.status, options.onlyEnrolled]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const getJourneyById = useCallback(
    (id: string): JourneyWithEnrollment | undefined => {
      return journeys.find((j) => j.id === id);
    },
    [journeys]
  );

  return {
    journeys,
    isLoading,
    error,
    refresh: fetchJourneys,
    getJourneyById,
  };
}

/**
 * Hook to get a single journey with full details
 */
export function useJourneyDetails(journeyId: string) {
  const { currentOrg, profile } = useAuth();
  const [journey, setJourney] = useState<JourneyWithEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchJourney = useCallback(async () => {
    if (!journeyId) {
      setJourney(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: journeyData, error: journeyError } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();

      if (journeyError) throw journeyError;

      let enrollment: Enrollment | undefined;

      if (profile) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('journey_id', journeyId)
          .eq('user_id', profile.id)
          .single();

        enrollment = enrollmentData as Enrollment | undefined;
      }

      setJourney({
        ...(journeyData as Journey),
        enrollment,
        isEnrolled: !!enrollment,
      });
    } catch (err) {
      console.error('Error fetching journey:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el journey');
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, profile, supabase]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  return {
    journey,
    isLoading,
    error,
    refresh: fetchJourney,
  };
}
