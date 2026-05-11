import { getLocalStorage } from '@/lib/localStorage';

const NOTIFY_COMP_ORIGIN = import.meta.env.VITE_NOTIFY_COMP_ORIGIN ?? '';
const NOTIFY_COMP_TOKEN_URL = '/.netlify/functions/notify-comp-token';

interface PushSubscriptionJson {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

export interface AssignmentNotificationWatch {
  competitionId: string;
  wcaUserId: number;
}

export type AssignmentNotificationStatus = NotificationPermission | 'not-signed-in' | 'unsupported';

const notifyCompUrl = (path: string) => `${NOTIFY_COMP_ORIGIN}${path}`;

const getAccessToken = () => {
  const expiresAt = Number(getLocalStorage('expirationTime') ?? 0);
  const accessToken = getLocalStorage('accessToken');

  if (!accessToken || !expiresAt || expiresAt <= Date.now()) {
    return null;
  }

  return accessToken;
};

const toUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = `${base64}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
};

export const getAssignmentNotificationStatus = (): AssignmentNotificationStatus => {
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return 'unsupported';
  }

  if (!getAccessToken()) {
    return 'not-signed-in';
  }

  return Notification.permission;
};

export const requestAssignmentNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return 'unsupported' as const;
  }

  if (Notification.permission === 'granted') {
    return 'granted' as const;
  }

  return await Notification.requestPermission();
};

const fetchNotifyCompToken = async () => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('Sign in with WCA to enable assignment notifications.');
  }

  const response = await fetch(NOTIFY_COMP_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { token?: string };
  if (!payload.token) {
    throw new Error('Notification token response was missing a token.');
  }

  return payload.token;
};

const fetchVapidPublicKey = async () => {
  const response = await fetch(notifyCompUrl('/v0/external/push/vapid-public-key'));

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { publicKey?: string };
  if (!payload.publicKey) {
    throw new Error('NotifyComp did not return a VAPID public key.');
  }

  return payload.publicKey;
};

const getPushSubscription = async () => {
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    return existing;
  }

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toUint8Array(await fetchVapidPublicKey()),
  });
};

export const enableAssignmentNotifications = async (watches: AssignmentNotificationWatch[]) => {
  const permission = await requestAssignmentNotificationPermission();
  if (permission !== 'granted') {
    return permission;
  }

  const [token, subscription] = await Promise.all([fetchNotifyCompToken(), getPushSubscription()]);
  const payload = subscription.toJSON() as PushSubscriptionJson;

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys.auth) {
    throw new Error('Browser push subscription is missing required keys.');
  }

  const response = await fetch(notifyCompUrl('/v0/external/push/subscriptions'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: payload.endpoint,
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
      watches,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return permission;
};

export const disableAssignmentNotifications = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const token = await fetchNotifyCompToken();
  const payload = subscription.toJSON() as PushSubscriptionJson;

  if (payload.endpoint) {
    await fetch(notifyCompUrl('/v0/external/push/subscriptions'), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: payload.endpoint }),
    });
  }

  await subscription.unsubscribe();
};
