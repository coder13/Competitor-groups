import { useCallback } from 'react';
import { WCA_ORIGIN } from '../lib/wca-env';
import { useAuth } from '../providers/AuthProvider';

export default function useWCAFetch() {
  const { accessToken } = useAuth();

  return useCallback(
    async <T>(path, fetchOptions = {}) => {
      const baseApiUrl = `${WCA_ORIGIN}/api/v0`;

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
        const error = await res.json();
        throw new Error(error?.error || res.statusText);
      }

      return (await res.json()) as T;
    },
    [accessToken]
  );
}
