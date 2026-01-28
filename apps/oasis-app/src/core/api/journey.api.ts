/**
 * Journey Service API Client (Port 8002)
 */

import { createApiClient, type ApiClient } from './client';
import { SERVICES } from '@/core/config/services';
import type {
  Journey,
  JourneyStep,
  Enrollment,
  EnrollmentWithJourney,
  StepCompletion,
  UserStats,
  Badge,
  LeaderboardEntry,
  JourneyStatus,
} from '@/core/types';
import type { PaginatedResponse, PaginationParams } from './types';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateJourneyRequest {
  title: string;
  description?: string;
  cover_image_url?: string;
  settings?: {
    isPublic?: boolean;
    requiresApproval?: boolean;
    allowSelfEnrollment?: boolean;
    maxParticipants?: number;
    startDate?: string;
    endDate?: string;
  };
}

export interface UpdateJourneyRequest extends Partial<CreateJourneyRequest> {
  status?: JourneyStatus;
}

export interface CreateStepRequest {
  title: string;
  description?: string;
  type: 'content' | 'quiz' | 'task' | 'typeform' | 'video' | 'link';
  order: number;
  points: number;
  content: Record<string, unknown>;
  is_required?: boolean;
}

export interface UpdateStepRequest extends Partial<CreateStepRequest> {}

export interface EnrollRequest {
  journey_id: string;
}

export interface CompleteStepRequest {
  submission_data?: Record<string, unknown>;
}

export interface JourneyFilters extends PaginationParams {
  status?: JourneyStatus;
  search?: string;
}

export interface LeaderboardFilters extends PaginationParams {
  period?: 'week' | 'month' | 'all';
}

// ============================================================================
// Journey API Client
// ============================================================================

export function createJourneyApi(
  getAccessToken?: () => Promise<string | null>,
  getOrganizationId?: () => string | null,
  onUnauthorized?: () => void
) {
  const client = createApiClient({
    baseUrl: SERVICES.JOURNEY,
    getAccessToken,
    getOrganizationId,
    onUnauthorized,
  });

  return {
    // ========================================================================
    // Journeys
    // ========================================================================

    /**
     * Get all journeys (filtered by organization)
     */
    getJourneys(filters?: JourneyFilters): Promise<PaginatedResponse<Journey>> {
      return client.get<PaginatedResponse<Journey>>('/journeys', {
        params: filters as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Get journey by ID
     */
    getJourney(journeyId: string): Promise<Journey> {
      return client.get<Journey>(`/journeys/${journeyId}`);
    },

    /**
     * Create new journey
     */
    createJourney(data: CreateJourneyRequest): Promise<Journey> {
      return client.post<Journey>('/journeys', data);
    },

    /**
     * Update journey
     */
    updateJourney(journeyId: string, data: UpdateJourneyRequest): Promise<Journey> {
      return client.patch<Journey>(`/journeys/${journeyId}`, data);
    },

    /**
     * Delete journey
     */
    deleteJourney(journeyId: string): Promise<void> {
      return client.delete<void>(`/journeys/${journeyId}`);
    },

    /**
     * Publish journey (change status to active)
     */
    publishJourney(journeyId: string): Promise<Journey> {
      return client.patch<Journey>(`/journeys/${journeyId}`, { status: 'active' });
    },

    /**
     * Archive journey
     */
    archiveJourney(journeyId: string): Promise<Journey> {
      return client.patch<Journey>(`/journeys/${journeyId}`, { status: 'archived' });
    },

    // ========================================================================
    // Journey Steps
    // ========================================================================

    /**
     * Get all steps for a journey
     */
    getJourneySteps(journeyId: string): Promise<JourneyStep[]> {
      return client.get<JourneyStep[]>(`/journeys/${journeyId}/steps`);
    },

    /**
     * Get single step
     */
    getStep(journeyId: string, stepId: string): Promise<JourneyStep> {
      return client.get<JourneyStep>(`/journeys/${journeyId}/steps/${stepId}`);
    },

    /**
     * Create step
     */
    createStep(journeyId: string, data: CreateStepRequest): Promise<JourneyStep> {
      return client.post<JourneyStep>(`/journeys/${journeyId}/steps`, data);
    },

    /**
     * Update step
     */
    updateStep(
      journeyId: string,
      stepId: string,
      data: UpdateStepRequest
    ): Promise<JourneyStep> {
      return client.patch<JourneyStep>(`/journeys/${journeyId}/steps/${stepId}`, data);
    },

    /**
     * Delete step
     */
    deleteStep(journeyId: string, stepId: string): Promise<void> {
      return client.delete<void>(`/journeys/${journeyId}/steps/${stepId}`);
    },

    /**
     * Reorder steps
     */
    reorderSteps(
      journeyId: string,
      stepOrder: string[]
    ): Promise<JourneyStep[]> {
      return client.patch<JourneyStep[]>(`/journeys/${journeyId}/steps/reorder`, {
        step_order: stepOrder,
      });
    },

    // ========================================================================
    // Enrollments
    // ========================================================================

    /**
     * Get current user's enrollments
     */
    getMyEnrollments(): Promise<EnrollmentWithJourney[]> {
      return client.get<EnrollmentWithJourney[]>('/enrollments/me');
    },

    /**
     * Get enrollment by ID
     */
    getEnrollment(enrollmentId: string): Promise<EnrollmentWithJourney> {
      return client.get<EnrollmentWithJourney>(`/enrollments/${enrollmentId}`);
    },

    /**
     * Enroll in a journey
     */
    enroll(data: EnrollRequest): Promise<Enrollment> {
      return client.post<Enrollment>('/enrollments', data);
    },

    /**
     * Drop from a journey
     */
    dropEnrollment(enrollmentId: string): Promise<void> {
      return client.delete<void>(`/enrollments/${enrollmentId}`);
    },

    /**
     * Get enrollment progress with step completions
     */
    getEnrollmentProgress(
      enrollmentId: string
    ): Promise<{
      enrollment: Enrollment;
      completions: StepCompletion[];
      steps: JourneyStep[];
    }> {
      return client.get(`/enrollments/${enrollmentId}/progress`);
    },

    /**
     * Complete a step
     */
    completeStep(
      enrollmentId: string,
      stepId: string,
      data?: CompleteStepRequest
    ): Promise<StepCompletion> {
      return client.post<StepCompletion>(
        `/enrollments/${enrollmentId}/steps/${stepId}/complete`,
        data
      );
    },

    // ========================================================================
    // Gamification
    // ========================================================================

    /**
     * Get current user's stats
     */
    getMyStats(): Promise<UserStats> {
      return client.get<UserStats>('/me/stats');
    },

    /**
     * Get current user's rewards/badges
     */
    getMyRewards(): Promise<Badge[]> {
      return client.get<Badge[]>('/me/rewards');
    },

    /**
     * Get leaderboard
     */
    getLeaderboard(filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> {
      return client.get<LeaderboardEntry[]>('/me/leaderboard', {
        params: filters as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Get all available badges
     */
    getAvailableBadges(): Promise<Badge[]> {
      return client.get<Badge[]>('/badges');
    },

    // ========================================================================
    // Admin: Journey Participants
    // ========================================================================

    /**
     * Get all enrollments for a journey (admin)
     */
    getJourneyEnrollments(
      journeyId: string,
      filters?: PaginationParams
    ): Promise<PaginatedResponse<EnrollmentWithJourney & { user: { id: string; full_name: string; email: string } }>> {
      return client.get(`/journeys/${journeyId}/enrollments`, {
        params: filters as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Manually enroll a user (admin)
     */
    enrollUser(journeyId: string, userId: string): Promise<Enrollment> {
      return client.post<Enrollment>(`/journeys/${journeyId}/enrollments`, { user_id: userId });
    },

    /**
     * Remove user from journey (admin)
     */
    removeUserEnrollment(journeyId: string, enrollmentId: string): Promise<void> {
      return client.delete<void>(`/journeys/${journeyId}/enrollments/${enrollmentId}`);
    },

    // ========================================================================
    // Utility
    // ========================================================================

    /**
     * Get raw client for custom requests
     */
    getClient(): ApiClient {
      return client;
    },
  };
}

export type JourneyApi = ReturnType<typeof createJourneyApi>;
