export const PWA_UPDATE_RELOAD_GUARD_MS = 30_000;

const PWA_UPDATE_LAST_RELOAD_AT_KEY = 'pwa-update-last-reload-at';

type UpdateRegistration = Pick<
  ServiceWorkerRegistration,
  'installing' | 'removeEventListener' | 'waiting'
> &
  Pick<EventTarget, 'addEventListener'>;

interface WatchForPWAUpdateOptions {
  getController: () => ServiceWorker | null;
  onUpdateReady: () => void;
}

export function watchForPWAUpdate(
  registration: UpdateRegistration,
  { getController, onUpdateReady }: WatchForPWAUpdateOptions,
) {
  let installingWorker: ServiceWorker | null = null;
  let onWorkerStateChange: (() => void) | undefined;

  const reportWaitingUpdate = () => {
    if (getController() && registration.waiting) {
      onUpdateReady();
    }
  };

  const onUpdateFound = () => {
    const worker = registration.installing;
    if (!worker) {
      return;
    }

    if (installingWorker && onWorkerStateChange) {
      installingWorker.removeEventListener('statechange', onWorkerStateChange);
    }
    installingWorker = worker;
    const onStateChange = () => {
      if (worker.state === 'installed') {
        reportWaitingUpdate();
      }
    };
    onWorkerStateChange = onStateChange;
    worker.addEventListener('statechange', onStateChange);
  };

  registration.addEventListener('updatefound', onUpdateFound);
  reportWaitingUpdate();

  return () => {
    registration.removeEventListener('updatefound', onUpdateFound);
    if (installingWorker && onWorkerStateChange) {
      installingWorker.removeEventListener('statechange', onWorkerStateChange);
    }
  };
}

interface WaitingServiceWorker {
  postMessage: ServiceWorker['postMessage'];
}

type PWAUpdateStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function requestPWAUpdate(registration: { waiting: WaitingServiceWorker | null }) {
  const worker = registration.waiting;
  if (!worker) {
    return false;
  }

  worker.postMessage({ type: 'SKIP_WAITING' });
  return true;
}

export function hasRecentPWAUpdateReload(storage: PWAUpdateStorage, now: number) {
  const lastReloadAt = Number(storage.getItem(PWA_UPDATE_LAST_RELOAD_AT_KEY));
  return Number.isFinite(lastReloadAt) && now - lastReloadAt < PWA_UPDATE_RELOAD_GUARD_MS;
}

export function markPWAUpdateReload(storage: PWAUpdateStorage, now: number) {
  storage.setItem(PWA_UPDATE_LAST_RELOAD_AT_KEY, String(now));
}
