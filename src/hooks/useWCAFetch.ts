import { useCallback } from 'react';
import { WCA_ORIGIN } from '../lib/wca-env';
import { useAuth } from '../providers/AuthProvider';

export default function useWCAFetch() {
  const { accessToken } = useAuth();

  return useCallback(
    async <T>(path, fetchOptions: RequestInit = {}) => {
      const baseApiUrl = `${WCA_ORIGIN}`;

      const res = await fetch(
        `${baseApiUrl}${path}`,
        Object.assign({}, fetchOptions, {
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return (await res.json()) as T;
    },
    [accessToken]
  );
}
