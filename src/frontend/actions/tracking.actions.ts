'use client';

// Mock Tracking Actions
// En el futuro, esto llamará a /api/analytics/track

export interface UserEvent {
  type: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string; // Injected by the hook or backend
}

const STORAGE_KEY = 'oasis_mock_events';

export const trackEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
  try {
    const event: UserEvent = {
      type: eventType,
      metadata,
      timestamp: new Date().toISOString(),
      // In a real app, userId would be strictly handled by the session
    };

    console.log('[TRACKING]', eventType, metadata);

    // Persist to localStorage for demo purposes
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existing.push(event);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to track event:', error);
    return { success: false };
  }
};

export const getMockEvents = async () => {
   if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
    return [];
}
