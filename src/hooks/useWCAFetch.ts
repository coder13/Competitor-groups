import { useCallback } from 'react';
import { WCA_ORIGIN } from '../lib/wca-env';
import { useAuth } from '../providers/AuthProvider';

export const wcaApiFetch = async <T>(path: string, fetchOptions: RequestInit = {}) => {
  const res = await fetch(`${WCA_ORIGIN}${path}`, fetchOptions);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return (await res.json()) as T;
};

export const useAuthenticatedWCAFetch = () => {
  const { accessToken } = useAuth();

  return useCallback(
    async <T>(path, fetchOptions: RequestInit = {}) => {
      const data = await wcaApiFetch<T>(path, {
        ...fetchOptions,
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }),
      });

      return data;
    },
    [accessToken]
  );
};
