const ASSIGNMENT_NOTIFICATION_TAG = 'assignment-reminder';
const CHECK_INTERVAL_MINUTES = 15;
const DEFAULT_NOTIFICATION_SERVICE_URL = '/api/notifications';

interface PushSubscriptionJson {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

export interface AssignmentNotificationPayload {
  title: string;
  body: string;
  competitionId?: string;
  registrantId?: number;
  startsAt?: string;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported' as const;
  }

  if (Notification.permission === 'granted') {
    return 'granted' as const;
  }

  const permission = await Notification.requestPermission();
  return permission;
}

function toUint8Array(base64: string) {
  const base64Padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + base64Padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

function getNotificationServiceUrl() {
  return import.meta.env.VITE_NOTIFICATION_SERVICE_URL ?? DEFAULT_NOTIFICATION_SERVICE_URL;
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    return existing;
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('Missing VITE_VAPID_PUBLIC_KEY');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toUint8Array(vapidPublicKey),
  });

  return subscription;
}

export async function syncSubscriptionWithBackend(subscription: PushSubscription) {
  const payload = subscription.toJSON() as PushSubscriptionJson;

  await fetch(`${getNotificationServiceUrl()}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      endpoint: payload.endpoint,
      p256dh: payload.keys?.p256dh,
      auth: payload.keys?.auth,
    }),
  });
}

export async function showAssignmentNotification(payload: AssignmentNotificationPayload) {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification(payload.title, {
    body: payload.body,
    tag: ASSIGNMENT_NOTIFICATION_TAG,
    data: payload,
  });
}

/**
 * Placeholder for background assignment checks.
 *
 * In a follow-up we should:
 * 1) register push subscription against a backend endpoint
 * 2) run periodic background checks (where supported)
 * 3) postMessage payloads into the SW and display user-facing notifications
 */
export async function bootstrapAssignmentNotificationChecks() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registerPushSubscription();
  if (subscription) {
    await syncSubscriptionWithBackend(subscription);
  }

  if ('periodicSync' in registration) {
    await (
      registration as ServiceWorkerRegistration & {
        periodicSync: {
          register: (tag: string, options: { minInterval: number }) => Promise<void>;
        };
      }
    ).periodicSync.register('assignment-checks', {
      minInterval: CHECK_INTERVAL_MINUTES * 60 * 1000,
    });
    return;
  }

  setInterval(
    () => {
      registration.active?.postMessage({
        type: 'ASSIGNMENT_CHECK_REQUEST',
        requestedAt: new Date().toISOString(),
      });
    },
    CHECK_INTERVAL_MINUTES * 60 * 1000,
  );
}
