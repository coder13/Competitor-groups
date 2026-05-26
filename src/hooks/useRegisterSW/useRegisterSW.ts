import { registerSW } from 'virtual:pwa-register';
import { useEffect, useRef, useState } from 'react';
import { startPWAUpdatePolling } from './pwaUpdatePolling';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateSWRef = useRef<(reloadPage?: boolean) => Promise<void>>();
  const stopUpdatePollingRef = useRef<() => void>();

  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    updateSWRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) {
          return;
        }

        stopUpdatePollingRef.current?.();
        stopUpdatePollingRef.current = startPWAUpdatePolling(registration);
      },
      onOfflineReady() {
        // optionally notify
      },
    });

    return () => {
      stopUpdatePollingRef.current?.();
    };
  }, []);

  const updateSW = async (reloadPage = true) => {
    setUpdateAvailable(false);
    await updateSWRef.current?.(reloadPage);
  };

  return { updateAvailable, updateSW };
}
