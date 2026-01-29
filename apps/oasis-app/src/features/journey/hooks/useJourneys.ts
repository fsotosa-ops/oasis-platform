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
    // Corrección para evitar crashes si currentOrg tiene estructura anidada o es null
    const orgId = currentOrg && 'id' in currentOrg 
        ? (currentOrg as any).id 
        : (currentOrg as any)?.data?.id;

    if (!orgId) {
      setJourneys([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch Journeys desde el schema 'journeys'
      let query = supabase
        .schema('journeys') // <--- CRÍTICO: Apuntar al schema correcto
        .from('journeys')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data: journeysData, error: journeysError } = await query;

      if (journeysError) throw journeysError;

      // 2. Fetch Enrollments para el usuario actual
      let enrollmentsMap: Map<string, Enrollment> = new Map();

      if (profile) {
        const { data: enrollmentsData } = await supabase
          .schema('journeys') // <--- CRÍTICO
          .from('enrollments')
          .select('*')
          .eq('user_id', profile.id);

        if (enrollmentsData) {
          enrollmentsMap = new Map(
            enrollmentsData.map((e) => [e.journey_id, e as Enrollment])
          );
        }
      }

      // 3. Combinar datos
      const combinedJourneys: JourneyWithEnrollment[] = (journeysData || []).map(
        (journey) => {
          const enrollment = enrollmentsMap.get(journey.id);
          return {
            ...(journey as Journey),
            enrollment,
            isEnrolled: !!enrollment,
          };
        }
      );

      // 4. Filtrar si es necesario
      const finalJourneys = options.onlyEnrolled
        ? combinedJourneys.filter((j) => j.isEnrolled)
        : combinedJourneys;

      setJourneys(finalJourneys);
    } catch (err: any) {
      console.error('Error fetching journeys:', JSON.stringify(err, null, 2));
      setError(err?.message || 'Error al cargar journeys');
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

export function useJourneyDetails(journeyId: string) {
  const { profile } = useAuth();
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
        .schema('journeys') // <--- CRÍTICO
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();

      if (journeyError) throw journeyError;

      let enrollment: Enrollment | undefined;

      if (profile) {
        const { data: enrollmentData } = await supabase
          .schema('journeys') // <--- CRÍTICO
          .from('enrollments')
          .select('*')
          .eq('journey_id', journeyId)
          .eq('user_id', profile.id)
          .maybeSingle();

        enrollment = enrollmentData as Enrollment | undefined;
      }

      setJourney({
        ...(journeyData as Journey),
        enrollment,
        isEnrolled: !!enrollment,
      });
    } catch (err: any) {
      console.error('Error fetching journey:', JSON.stringify(err, null, 2));
      setError(err?.message || 'Error al cargar el journey');
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