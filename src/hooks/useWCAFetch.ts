import { useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { wcaApiFetch } from '../lib/api';

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
