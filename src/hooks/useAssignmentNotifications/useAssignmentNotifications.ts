import { useCallback, useMemo, useState } from 'react';
import {
  AssignmentNotificationStatus,
  disableAssignmentNotifications,
  enableAssignmentNotifications,
  getAssignmentNotificationStatus,
} from '@/lib/notifications/assignmentNotifications';

interface UseAssignmentNotificationsParams {
  competitions: ApiCompetition[];
  user: User | null;
}

export function useAssignmentNotifications({
  competitions,
  user,
}: UseAssignmentNotificationsParams) {
  const [status, setStatus] = useState<AssignmentNotificationStatus>(
    getAssignmentNotificationStatus,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watches = useMemo(
    () =>
      user
        ? competitions.map((competition) => ({
            competitionId: competition.id,
            wcaUserId: user.id,
          }))
        : [],
    [competitions, user],
  );

  const enable = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      const nextStatus = await enableAssignmentNotifications(watches);
      setStatus(nextStatus);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to enable assignment notifications.');
      setStatus(getAssignmentNotificationStatus());
    } finally {
      setIsSaving(false);
    }
  }, [watches]);

  const disable = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await disableAssignmentNotifications();
      setStatus(getAssignmentNotificationStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to disable assignment notifications.');
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    canEnable: status === 'default' && watches.length > 0,
    canDisable: status === 'granted',
    enable,
    disable,
    error,
    isSaving,
    status,
    watchCount: watches.length,
  };
}
