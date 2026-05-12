import { getLocalStorage } from './localStorage';

export const getStoredWcaAccessToken = () => {
  const expiresAt = Number(getLocalStorage('expirationTime') ?? 0);
  const accessToken = getLocalStorage('accessToken');

  if (!accessToken || !expiresAt || expiresAt <= Date.now()) {
    return null;
  }

  return accessToken;
};
