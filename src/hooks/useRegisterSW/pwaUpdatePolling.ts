export const PWA_UPDATE_CHECK_INTERVAL_MS = 60_000;

type UpdateableServiceWorkerRegistration = Pick<ServiceWorkerRegistration, 'update'>;

interface StartPWAUpdatePollingOptions {
  intervalMs?: number;
  isVisible?: () => boolean;
}

export function startPWAUpdatePolling(
  registration: UpdateableServiceWorkerRegistration,
  {
    intervalMs = PWA_UPDATE_CHECK_INTERVAL_MS,
    isVisible = () => document.visibilityState === 'visible',
  }: StartPWAUpdatePollingOptions = {},
) {
  const checkForUpdate = () => {
    if (isVisible()) {
      void registration.update();
    }
  };

  checkForUpdate();

  const intervalId = window.setInterval(checkForUpdate, intervalMs);

  return () => window.clearInterval(intervalId);
}
