import { registerSW } from 'virtual:pwa-register';
import { useEffect, useRef, useState } from 'react';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateSWRef = useRef<(reloadPage?: boolean) => Promise<void>>();

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        // optionally notify
      },
    });
  }, []);

  const updateSW = async (reloadPage = true) => {
    setUpdateAvailable(false);
    await updateSWRef.current?.(reloadPage);
  };

  return { updateAvailable, updateSW };
}
