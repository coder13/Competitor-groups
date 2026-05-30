import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AssignmentNotificationStatus,
  disableAssignmentNotifications,
  enableAssignmentNotifications,
  getAssignmentNotificationStatus,
  isAssignmentNotificationsEnabled,
  testAssignmentNotifications,
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
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  const clearFeedback = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const enable = useCallback(async () => {
    setIsSaving(true);
    clearFeedback();

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
  }, [clearFeedback, watches]);

  const disable = useCallback(async () => {
    setIsSaving(true);
    clearFeedback();

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
  }, [clearFeedback]);

  const test = useCallback(async () => {
    setIsTesting(true);
    clearFeedback();

    try {
      await testAssignmentNotifications();
      setSuccessMessage('Test notification sent.');
      setIsEnabled(isAssignmentNotificationsEnabled());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to send test notification.');
      setStatus(getAssignmentNotificationStatus());
      setIsEnabled(isAssignmentNotificationsEnabled());
    } finally {
      setIsTesting(false);
    }
  }, [clearFeedback]);

  return {
    canEnable: (status === 'default' || status === 'granted') && !isEnabled && watches.length > 0,
    canDisable: status === 'granted' && isEnabled,
    canTest: status === 'granted' && isEnabled,
    enable,
    disable,
    error,
    isTesting,
    isSaving,
    status,
    successMessage,
    test,
    watchCount: watches.length,
  };
}
