import { deleteLocalStorage, getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { getStoredWcaAccessToken } from '@/lib/wcaAccessToken';
import {
  clearNotifyCompPushSessionToken,
  getNotifyCompPushSessionToken,
  setNotifyCompPushSessionToken,
} from './notifyCompPushSession';

const NOTIFY_COMP_ORIGIN =
  import.meta.env.VITE_NOTIFY_COMP_ORIGIN ?? 'https://api.notifycomp.com/api';
const NOTIFY_COMP_TOKEN_URL = '/.netlify/functions/notify-comp-token';
const ENABLED_STORAGE_KEY = 'assignmentNotifications.enabled';
const SERVICE_WORKER_TIMEOUT_MS = 10000;
const INVALID_PUSH_SESSION_STATUSES = new Set([401, 403, 404, 410]);

interface PushSubscriptionJson {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

interface PushSessionResponse {
  sessionToken?: string;
  token?: string;
}

interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface AssignmentNotificationWatch {
  competitionId: string;
  wcaUserId: number;
}

export type AssignmentNotificationStatus = NotificationPermission | 'reauthorize' | 'unsupported';

const notifyCompUrl = (path: string) => `${NOTIFY_COMP_ORIGIN}${path}`;

export const isAssignmentNotificationsEnabled = () =>
  Boolean(getNotifyCompPushSessionToken()) || getLocalStorage(ENABLED_STORAGE_KEY) === 'true';

const clearAssignmentNotificationState = () => {
  clearNotifyCompPushSessionToken();
  deleteLocalStorage(ENABLED_STORAGE_KEY);
};

const isInvalidPushSessionResponse = (response: Response) =>
  INVALID_PUSH_SESSION_STATUSES.has(response.status);

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

  if (!getNotifyCompPushSessionToken() && !getStoredWcaAccessToken()) {
    return 'reauthorize';
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

const readErrorMessage = async (response: Response) => {
  const text = await response.text();

  try {
    const payload = JSON.parse(text) as { message?: string };
    return payload.message || text;
  } catch {
    return text;
  }
};

const fetchNotifyCompToken = async () => {
  const accessToken = getStoredWcaAccessToken();
  if (!accessToken) {
    throw new Error('Refresh your WCA authorization to enable assignment notifications.');
  }

  const response = await fetch(NOTIFY_COMP_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as { token?: string };
  if (!payload.token) {
    throw new Error('Notification token response was missing a token.');
  }

  return payload.token;
};

const canFallbackToLegacySubscriptions = (response: Response) =>
  response.status === 404 || response.status === 405;

const fetchVapidPublicKey = async () => {
  const response = await fetch(notifyCompUrl('/v0/external/push/vapid-public-key'));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = (await response.json()) as { publicKey?: string };
  if (!payload.publicKey) {
    throw new Error('NotifyComp did not return a VAPID public key.');
  }

  return payload.publicKey;
};

const withTimeout = async <T>(promise: Promise<T>, message: string) =>
  await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), SERVICE_WORKER_TIMEOUT_MS);
    }),
  ]);

const getServiceWorkerRegistration = async () => {
  if (import.meta.env.DEV) {
    return await navigator.serviceWorker.register('/notification-sw.js');
  }

  return await withTimeout(
    navigator.serviceWorker.ready,
    'Notification service worker was not ready. Refresh the page and try again.',
  );
};

const getPushSubscription = async () => {
  const registration = await getServiceWorkerRegistration();
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    return existing;
  }

  return await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: toUint8Array(await fetchVapidPublicKey()),
  });
};

const unsubscribePushSubscription = async () => {
  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();
  await subscription?.unsubscribe();
};

const pushSubscriptionPayload = (subscription: PushSubscription): PushSubscriptionPayload => {
  const payload = subscription.toJSON() as PushSubscriptionJson;

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys.auth) {
    throw new Error('Browser push subscription is missing required keys.');
  }

  return {
    auth: payload.keys.auth,
    endpoint: payload.endpoint,
    p256dh: payload.keys.p256dh,
  };
};

const registerLegacySubscription = async (
  authToken: string,
  payload: PushSubscriptionPayload,
  watches: AssignmentNotificationWatch[],
) => {
  const response = await fetch(notifyCompUrl('/v0/external/push/subscriptions'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      watches,
    }),
  });

  if (!response.ok) {
    clearAssignmentNotificationState();
    throw new Error(await readErrorMessage(response));
  }
};

const createPushSession = async (
  authToken: string,
  payload: PushSubscriptionPayload,
  watches: AssignmentNotificationWatch[],
) => {
  const response = await fetch(notifyCompUrl('/v0/external/push/sessions'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      watches,
    }),
  });

  if (canFallbackToLegacySubscriptions(response)) {
    await registerLegacySubscription(authToken, payload, watches);
    return;
  }

  if (!response.ok) {
    clearAssignmentNotificationState();
    throw new Error(await readErrorMessage(response));
  }

  const session = (await response.json()) as PushSessionResponse;
  const sessionToken = session.sessionToken || session.token;
  if (!sessionToken) {
    clearAssignmentNotificationState();
    throw new Error('NotifyComp push session response was missing a session token.');
  }

  setNotifyCompPushSessionToken(sessionToken);
};

const updatePushSession = async (
  sessionToken: string,
  payload: PushSubscriptionPayload,
  watches: AssignmentNotificationWatch[],
) => {
  const response = await fetch(notifyCompUrl('/v0/external/push/sessions/current'), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      watches,
    }),
  });

  if (isInvalidPushSessionResponse(response)) {
    clearNotifyCompPushSessionToken();
    return false;
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return true;
};

export const enableAssignmentNotifications = async (watches: AssignmentNotificationWatch[]) => {
  const permission = await requestAssignmentNotificationPermission();
  if (permission !== 'granted') {
    return permission;
  }

  const subscription = await getPushSubscription();
  const payload = pushSubscriptionPayload(subscription);
  const sessionToken = getNotifyCompPushSessionToken();

  if (sessionToken && (await updatePushSession(sessionToken, payload, watches))) {
    setLocalStorage(ENABLED_STORAGE_KEY, 'true');
    return permission;
  }

  await createPushSession(await fetchNotifyCompToken(), payload, watches);

  setLocalStorage(ENABLED_STORAGE_KEY, 'true');
  return permission;
};

const deletePushSession = async (sessionToken: string, endpoint?: string) => {
  const response = await fetch(notifyCompUrl('/v0/external/push/sessions/current'), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });

  if (
    !response.ok &&
    response.status !== 401 &&
    response.status !== 403 &&
    response.status !== 404
  ) {
    throw new Error(await readErrorMessage(response));
  }
};

const deleteLegacySubscription = async (endpoint: string) => {
  const token = await fetchNotifyCompToken();

  await fetch(notifyCompUrl('/v0/external/push/subscriptions'), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
};

export const disableAssignmentNotifications = async () => {
  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();
  const sessionToken = getNotifyCompPushSessionToken();

  if (!subscription) {
    clearAssignmentNotificationState();
    return;
  }

  const payload = subscription.toJSON() as PushSubscriptionJson;

  if (sessionToken) {
    await deletePushSession(sessionToken, payload.endpoint);
  } else if (payload.endpoint) {
    await deleteLegacySubscription(payload.endpoint);
  }

  await subscription.unsubscribe();
  clearAssignmentNotificationState();
};

export const testAssignmentNotifications = async () => {
  const sessionToken = getNotifyCompPushSessionToken();
  if (!sessionToken) {
    throw new Error('Enable assignment notifications before sending a test notification.');
  }

  const response = await fetch(notifyCompUrl('/v0/external/push/sessions/current/test'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (isInvalidPushSessionResponse(response)) {
    clearAssignmentNotificationState();
    await unsubscribePushSubscription().catch(() => undefined);
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
};
