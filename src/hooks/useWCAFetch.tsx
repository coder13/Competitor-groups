import { useCallback } from 'react';
import { WCA_ORIGIN } from '../lib/wca-env';
import { useAuth } from '../providers/AuthProvider';

export default function useWCAFetch() {
  const { accessToken } = useAuth();
  console.log(accessToken);
  return useCallback(
    async (path: string, fetchOptions = {}) => {
      const baseApiUrl = `${WCA_ORIGIN}/api/v0`;

      console.log('fetching', path, accessToken);

      return await fetch(
        `${baseApiUrl}${path}`,
        Object.assign({}, fetchOptions, {
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }),
        })
      )
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText);
          return response;
        })
        .then((response) => response.json());
    },
    [accessToken]
  );
}
