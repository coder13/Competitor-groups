import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AssignmentNotificationStatus,
  disableAssignmentNotifications,
  enableAssignmentNotifications,
  getAssignmentNotificationStatus,
  isAssignmentNotificationsEnabled,
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
  const [isEnabled, setIsEnabled] = useState(isAssignmentNotificationsEnabled);

  useEffect(() => {
    setStatus(getAssignmentNotificationStatus());
    setIsEnabled(isAssignmentNotificationsEnabled());
  }, [user]);

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
      setIsEnabled(isAssignmentNotificationsEnabled());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to enable assignment notifications.');
      setStatus(getAssignmentNotificationStatus());
      setIsEnabled(isAssignmentNotificationsEnabled());
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
      setIsEnabled(isAssignmentNotificationsEnabled());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to disable assignment notifications.');
      setIsEnabled(isAssignmentNotificationsEnabled());
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    canEnable: (status === 'default' || status === 'granted') && !isEnabled && watches.length > 0,
    canDisable: status === 'granted' && isEnabled,
    enable,
    disable,
    error,
    isSaving,
    status,
    watchCount: watches.length,
  };
}
