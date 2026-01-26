'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/frontend/actions/tracking.actions';

export const useUserActivity = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views automatically
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackEvent('PAGE_VIEW', { url, path: pathname });
  }, [pathname, searchParams]);

  // Helper to track custom interactions
  const trackInteraction = useCallback((eventName: string, metadata: Record<string, any> = {}) => {
    trackEvent(eventName, metadata);
  }, []);

  return { trackInteraction };
};
