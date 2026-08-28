import { useEffect, useRef, useState } from 'react';
import {
  hasRecentPWAUpdateReload,
  markPWAUpdateReload,
  requestPWAUpdate,
  watchForPWAUpdate,
} from './pwaUpdate';
import { startPWAUpdatePolling } from './pwaUpdatePolling';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration>();
  const stopUpdatePollingRef = useRef<() => void>();

  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    let active = true;
    let stopWatchingForUpdates: (() => void) | undefined;

    void navigator.serviceWorker
      .register('/sw.js', {
        updateViaCache: 'none',
      })
      .then((registration) => {
        if (!active) {
          return;
        }

        registrationRef.current = registration;
        stopWatchingForUpdates = watchForPWAUpdate(registration, {
          getController: () => navigator.serviceWorker.controller,
          onUpdateReady: () => setUpdateAvailable(true),
        });
        stopUpdatePollingRef.current?.();
        stopUpdatePollingRef.current = startPWAUpdatePolling(registration);
      })
      .catch(() => undefined);

    return () => {
      active = false;
      stopWatchingForUpdates?.();
      stopUpdatePollingRef.current?.();
    };
  }, []);

  const updateSW = async () => {
    setUpdateAvailable(false);
    const registration = registrationRef.current;
    if (!registration) {
      return;
    }

    try {
      await registration.update();
    } catch {
      setUpdateAvailable(true);
      return;
    }
    if (!registration.waiting || hasRecentPWAUpdateReload(sessionStorage, Date.now())) {
      return;
    }

    markPWAUpdateReload(sessionStorage, Date.now());
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    });
    requestPWAUpdate(registration);
  };

  return { updateAvailable, updateSW };
}
