import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackCompetitionEvent } from '@/lib/analytics';
import { useAuth } from '@/providers/AuthProvider';
import { usePageActivityTracking } from '../usePageActivityTracking';

const competitionPageName = (pathname: string, competitionId: string) => {
  const competitionRoot = `/competitions/${competitionId}`;
  const relativePath = pathname.replace(competitionRoot, '') || '/';

  if (relativePath === '/') {
    return 'groups';
  }

  if (relativePath.startsWith('/activities') || relativePath.startsWith('/rooms')) {
    return 'schedule';
  }

  if (relativePath === '/live' || relativePath === '/admin/remote') {
    return 'live_activities';
  }

  if (relativePath === '/admin/scramblers') {
    return 'assignments';
  }

  return relativePath.replace(/^\//, '').replace(/\//g, '_') || 'competition';
};

const pageViewEventName = (page: string) => {
  if (page === 'groups') {
    return 'groups_viewed';
  }

  if (page === 'schedule') {
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

    const eventName = pageViewEventName(page);
    if (!eventName) {
      return;
    }

    const eventKey = `${competitionId}:${location.pathname}:${eventName}`;
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
  }, [competitionId, location.pathname, page, user?.id]);

  usePageActivityTracking({
    competitionId,
    page,
    userId: user?.id,
  });
};
