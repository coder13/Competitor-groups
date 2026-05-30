import { deleteLocalStorage, getLocalStorage, setLocalStorage } from '@/lib/localStorage';

const PUSH_SESSION_TOKEN_KEY = 'notifyComp.pushSessionToken';

interface JwtClaims {
  exp?: number;
}

const decodeJwtPayload = (token: string): JwtClaims | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(normalized)) as JwtClaims;
  } catch {
    return null;
  }
};

export const getNotifyCompPushSessionToken = () => {
  const token = getLocalStorage(PUSH_SESSION_TOKEN_KEY);
  if (!token) {
    return null;
  }

  const claims = decodeJwtPayload(token);
  if (claims?.exp && claims.exp * 1000 <= Date.now()) {
    deleteLocalStorage(PUSH_SESSION_TOKEN_KEY);
    return null;
  }

  return token;
};

export const setNotifyCompPushSessionToken = (token: string) => {
  setLocalStorage(PUSH_SESSION_TOKEN_KEY, token);
};

export const clearNotifyCompPushSessionToken = () => {
  deleteLocalStorage(PUSH_SESSION_TOKEN_KEY);
};
