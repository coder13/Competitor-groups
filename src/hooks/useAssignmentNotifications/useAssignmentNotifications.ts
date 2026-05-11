import { useCallback, useEffect, useState } from 'react';
import {
  bootstrapAssignmentNotificationChecks,
  requestNotificationPermission,
} from '@/lib/notifications/assignmentNotifications';

type NotificationStatus = NotificationPermission | 'unsupported';

export function useAssignmentNotifications() {
  const [status, setStatus] = useState<NotificationStatus>(() => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    return Notification.permission;
  });
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableNotifications = useCallback(async () => {
    setIsEnabling(true);
    setError(null);

    try {
      const permission = await requestNotificationPermission();
      setStatus(permission);

      if (permission === 'granted') {
        await bootstrapAssignmentNotificationChecks();
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to enable notifications');
    } finally {
      setIsEnabling(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'granted') {
      return;
    }

    void bootstrapAssignmentNotificationChecks();
  }, [status]);

  return {
    status,
    notificationsEnabled: status === 'granted',
    isEnabling,
    error,
    enableNotifications,
  };
}
