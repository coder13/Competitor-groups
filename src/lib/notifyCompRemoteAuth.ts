import { deleteLocalStorage, getLocalStorage, setLocalStorage } from './localStorage';

const REMOTE_JWT_KEY = 'notifyComp.jwt';

interface JwtClaims {
  competitionIds?: string[];
  competition_ids?: string[];
  exp?: number;
  id?: number;
  name?: string;
  scope?: string | string[];
  scopes?: string[];
  wcaUserId?: number;
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

export const getNotifyCompRemoteToken = () => {
  const token = getLocalStorage(REMOTE_JWT_KEY);
  if (!token) {
    return null;
  }

  const claims = decodeJwtPayload(token);
  if (claims?.exp && claims.exp * 1000 <= Date.now()) {
    deleteLocalStorage(REMOTE_JWT_KEY);
    return null;
  }

  return token;
};

export const getNotifyCompRemoteClaims = () => {
  const token = getNotifyCompRemoteToken();
  return token ? decodeJwtPayload(token) : null;
};

export const hasNotifyCompRemoteToken = () => Boolean(getNotifyCompRemoteClaims());

export const setNotifyCompRemoteToken = (token: string) => {
  setLocalStorage(REMOTE_JWT_KEY, token);
};

export const clearNotifyCompRemoteToken = () => {
  deleteLocalStorage(REMOTE_JWT_KEY);
};
