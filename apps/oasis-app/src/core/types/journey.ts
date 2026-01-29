/**
 * Journey and gamification types
 */

export type JourneyStatus = 'draft' | 'active' | 'archived' | 'completed';
export type StepType = 'content' | 'quiz' | 'task' | 'typeform' | 'video' | 'link';
export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';

/**
 * Payload para el tracking de progreso
 * Requerido para: useStepProgress.ts y journey.api.ts
 */
export interface TrackProgressPayload {
  journey_id: string;
  step_id: string;
  status: 'completed' | 'in_progress';
  metadata?: Record<string, unknown>;
}

/**
 * Step content varies by type
 */
export interface StepContent {
  body?: string;
  video_url?: string;
  quiz_id?: string;
  form_id?: string;
  link_url?: string;
  [key: string]: unknown;
}

/**
 * Journey step
 */
export interface JourneyStep {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  type: StepType;
  order: number;
  points: number;
  content: StepContent;
  is_required: boolean;
  duration_minutes?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Journey settings
 */
export interface JourneySettings {
  isPublic?: boolean;
  requiresApproval?: boolean;
  allowSelfEnrollment?: boolean;
  maxParticipants?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

/**
 * Journey entity
 */
export interface Journey {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: JourneyStatus;
  settings: JourneySettings;
  
  // Array de pasos opcional (para cuando se carga el detalle completo)
  steps?: JourneyStep[];
  
  total_steps: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

/**
 * Enrollment record
 */
export interface Enrollment {
  id: string;
  journey_id: string;
  user_id: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  completed_steps: number;
  total_steps: number;
  points_earned: number;
  enrolled_at: string;
  completed_at: string | null;
}

/**
 * Enrollment with journey details
 */
export interface EnrollmentWithJourney extends Enrollment {
  journey: Journey;
}

export interface JourneyWithEnrollment extends Journey {
  enrollment?: Enrollment;
  isEnrolled: boolean;
}

/**
 * Step completion record
 */
export interface StepCompletion {
  id: string;
  enrollment_id: string;
  step_id: string;
  completed_at: string;
  points_awarded: number;
  submission_data?: Record<string, unknown>;
}

/**
 * User gamification stats
 */
export interface UserStats {
  total_points: number;
  level: number;
  level_name: string;
  level_progress: number; // 0-100 progress to next level
  journeys_completed: number;
  journeys_in_progress: number;
  badges_earned: number;
  rank?: number; // position in leaderboard
}

/**
 * Badge/reward
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  points_required?: number;
  earned_at?: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
}