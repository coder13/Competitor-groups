import {
  hasRecentPWAUpdateReload,
  markPWAUpdateReload,
  requestPWAUpdate,
  watchForPWAUpdate,
} from './pwaUpdate';

class MockServiceWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
  postMessage = jest.fn();
}

class MockRegistration extends EventTarget {
  installing: MockServiceWorker | null = null;
  waiting: MockServiceWorker | null = null;
}

describe('watchForPWAUpdate', () => {
  it('reports an existing waiting update when a worker already controls the page', () => {
    const registration = new MockRegistration();
    registration.waiting = new MockServiceWorker();
    const onUpdateReady = jest.fn();

    watchForPWAUpdate(registration as unknown as ServiceWorkerRegistration, {
      getController: () => new MockServiceWorker() as unknown as ServiceWorker,
      onUpdateReady,
    });

    expect(onUpdateReady).toHaveBeenCalledTimes(1);
  });

  it('reports a newly installed update', () => {
    const registration = new MockRegistration();
    const installingWorker = new MockServiceWorker();
    registration.installing = installingWorker;
    const onUpdateReady = jest.fn();

    watchForPWAUpdate(registration as unknown as ServiceWorkerRegistration, {
      getController: () => new MockServiceWorker() as unknown as ServiceWorker,
      onUpdateReady,
    });

    registration.dispatchEvent(new Event('updatefound'));
    registration.waiting = installingWorker;
    installingWorker.state = 'installed';
    installingWorker.dispatchEvent(new Event('statechange'));

    expect(onUpdateReady).toHaveBeenCalledTimes(1);
  });
});

describe('requestPWAUpdate', () => {
  it('asks a waiting worker to activate', () => {
    const worker = new MockServiceWorker();
    const updated = requestPWAUpdate({ waiting: worker });

    expect(updated).toBe(true);
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('does nothing when no update is waiting', () => {
    const updated = requestPWAUpdate({ waiting: null });

    expect(updated).toBe(false);
  });
});

describe('the PWA reload guard', () => {
  it('blocks only a second reload during the guard window', () => {
    const storage = new Map<string, string>();
    const sessionStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    };

    markPWAUpdateReload(sessionStorage, 1_000);

    expect(hasRecentPWAUpdateReload(sessionStorage, 20_000)).toBe(true);
    expect(hasRecentPWAUpdateReload(sessionStorage, 40_000)).toBe(false);
  });
});
