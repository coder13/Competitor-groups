import { registerSW } from 'virtual:pwa-register';
import { useState } from 'react';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateSW = registerSW({
    onNeedRefresh() {
      setUpdateAvailable(true);
    },
    onOfflineReady() {
      // optionally notify
    },
  });

  return { updateAvailable, updateSW };
}
