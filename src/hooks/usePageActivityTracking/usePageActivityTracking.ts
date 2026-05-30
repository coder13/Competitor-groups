import { useEffect } from 'react';
import { trackCompetitionEvent } from '@/lib/analytics';

const ACTIVE_INTERVAL_MS = 60_000;

interface UsePageActivityTrackingParams {
  competitionId?: string;
  page: string;
  userId?: number;
}

export const usePageActivityTracking = ({
  competitionId,
  page,
  userId,
}: UsePageActivityTrackingParams) => {
  useEffect(() => {
    if (!competitionId || typeof document === 'undefined') {
      return undefined;
    }

    const trackActivePage = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      trackCompetitionEvent('page_active_60s', {
        competition_id: competitionId,
        page,
        user_id: userId,
      });
    };

    const intervalId = window.setInterval(trackActivePage, ACTIVE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [competitionId, page, userId]);
};
