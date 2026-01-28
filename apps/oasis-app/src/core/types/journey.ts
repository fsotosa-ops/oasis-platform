/**
 * Journey and gamification types
 */

export type JourneyStatus = 'draft' | 'active' | 'archived' | 'completed';

export type StepType = 'content' | 'quiz' | 'task' | 'typeform' | 'video' | 'link';

export type EnrollmentStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';

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
  total_steps: number;
  total_points: number;
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
  created_at: string;
  updated_at: string;
}

/**
 * Step content varies by type
 */
export interface StepContent {
  // For content type
  body?: string;
  // For quiz type
  questions?: QuizQuestion[];
  // For typeform type
  typeform_id?: string;
  typeform_url?: string;
  // For video type
  video_url?: string;
  video_provider?: 'youtube' | 'vimeo' | 'custom';
  // For link type
  url?: string;
  // For task type
  instructions?: string;
  submission_type?: 'text' | 'file' | 'link';
  [key: string]: unknown;
}

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

/**
 * User enrollment in a journey
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
  level: number;
  badges_count: number;
}

/**
 * Journey with enrollment status for current user
 */
export interface JourneyWithEnrollment extends Journey {
  enrollment?: Enrollment;
  isEnrolled: boolean;
}
