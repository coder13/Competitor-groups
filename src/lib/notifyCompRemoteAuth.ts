import { deleteLocalStorage, getLocalStorage, setLocalStorage } from './localStorage';

const REMOTE_JWT_KEY = 'notifyComp.jwt';
const REMOTE_AUTH_PENDING_KEY = 'notifyComp.authPending';
const REMOTE_REDIRECT_PATH_KEY = 'notifyComp.redirectPath';

interface JwtClaims {
  exp?: number;
  name?: string;
  id?: number;
}

const decodeJwtPayload = (token: string): JwtClaims | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
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

export const setNotifyCompRemoteToken = (token: string) => {
  setLocalStorage(REMOTE_JWT_KEY, token);
};

export const clearNotifyCompRemoteToken = () => {
  deleteLocalStorage(REMOTE_JWT_KEY);
};

export const setNotifyCompRemoteAuthPending = (redirectPath: string) => {
  setLocalStorage(REMOTE_AUTH_PENDING_KEY, 'true');
  setLocalStorage(REMOTE_REDIRECT_PATH_KEY, redirectPath);
};

export const isNotifyCompRemoteAuthPending = () =>
  getLocalStorage(REMOTE_AUTH_PENDING_KEY) === 'true';

export const consumeNotifyCompRemoteRedirectPath = () => {
  const redirectPath = getLocalStorage(REMOTE_REDIRECT_PATH_KEY) || '/';
  deleteLocalStorage(REMOTE_AUTH_PENDING_KEY);
  deleteLocalStorage(REMOTE_REDIRECT_PATH_KEY);
  return redirectPath;
};
