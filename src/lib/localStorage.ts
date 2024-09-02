import { WCA_OAUTH_CLIENT_ID } from './wca-env';

export const localStorageKey = (key: string) => `competition-groups.${WCA_OAUTH_CLIENT_ID}.${key}`;

export const getLocalStorage = (key: string) => localStorage.getItem(localStorageKey(key));
export const setLocalStorage = (key: string, value: string) =>
  localStorage.setItem(localStorageKey(key), value);

export const deleteLocalStorage = (key: string) => localStorage.removeItem(localStorageKey(key));
