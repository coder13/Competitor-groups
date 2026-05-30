import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackCompetitionEvent } from '@/lib/analytics';
import { competitionPageName } from '@/lib/analyticsPages';
import { useAuth } from '@/providers/AuthProvider';
import { usePageActivityTracking } from '../usePageActivityTracking';

const featureViewEventName = (page: string) => {
  if (page === 'groups') {
    return 'groups_viewed';
  }

  if (
    page === 'schedule' ||
    page === 'schedule_activity' ||
    page === 'schedule_rooms' ||
    page === 'schedule_room'
  ) {
    return 'schedule_viewed';
  }

  if (page === 'assignments') {
    return 'assignments_viewed';
  }

  if (page === 'live_activities') {
    return 'live_activities_opened';
  }

  return undefined;
};

export const useCompetitionAnalytics = (competitionId?: string) => {
  const location = useLocation();
  const { user } = useAuth();
  const lastCompetitionId = useRef<string>();
  const lastPageEventKey = useRef<string>();

  const page = useMemo(
    () => (competitionId ? competitionPageName(location.pathname, competitionId) : 'competition'),
    [competitionId, location.pathname],
  );

  useEffect(() => {
    if (!competitionId) {
      return;
    }

    if (lastCompetitionId.current !== competitionId) {
      trackCompetitionEvent('competition_viewed', {
        competition_id: competitionId,
        page,
        user_id: user?.id,
      });
      lastCompetitionId.current = competitionId;
    }
  }, [competitionId, page, user?.id]);

  useEffect(() => {
    if (!competitionId) {
      return;
    }

    const eventName = featureViewEventName(page);
    if (!eventName) {
      return;
    }

    const eventKey = `${competitionId}:${location.pathname}${location.search}:${eventName}`;
    if (lastPageEventKey.current === eventKey) {
      return;
    }

    trackCompetitionEvent(eventName, {
      competition_id: competitionId,
      page,
      feature: page === 'live_activities' ? 'live_activities' : undefined,
      user_id: user?.id,
    });
    lastPageEventKey.current = eventKey;
  }, [competitionId, location.pathname, location.search, page, user?.id]);

  usePageActivityTracking({
    competitionId,
    page,
    userId: user?.id,
  });
};
