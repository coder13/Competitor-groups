import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  clearNotifyCompRemoteToken,
  consumeNotifyCompRemoteRedirectPath,
  getNotifyCompRemoteClaims,
  getNotifyCompRemoteToken,
  isNotifyCompRemoteAuthPending,
  setNotifyCompRemoteAuthPending,
  setNotifyCompRemoteToken,
} from '@/lib/notifyCompRemoteAuth';
import { NOTIFYCOMP_AUTH_ORIGIN } from '@/lib/remoteConfig';
import { NotifyCompRemoteAuthContext } from './NotifyCompRemoteAuthContext';

const readErrorMessage = async (response: Response) => {
  const text = await response.text();

  try {
    const payload = JSON.parse(text) as { message?: string };
    return payload.message || text;
  } catch {
    return text;
  }
};

export function NotifyCompRemoteAuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState(getNotifyCompRemoteToken);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const signIn = useCallback(() => {
    const redirectPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    setNotifyCompRemoteAuthPending(redirectPath);
    setError(null);

    const params = new URLSearchParams({
      redirect_uri: window.location.href,
    });

    window.location.href = `${NOTIFYCOMP_AUTH_ORIGIN}/auth/wca?${params.toString()}`;
  }, []);

  const signOut = useCallback(() => {
    clearNotifyCompRemoteToken();
    setToken(null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code || !isNotifyCompRemoteAuthPending()) {
      return;
    }

    setAuthenticating(true);
    setError(null);

    const callbackParams = new URLSearchParams({
      code,
      redirect_uri: window.location.href,
    });

    fetch(`${NOTIFYCOMP_AUTH_ORIGIN}/auth/wca/callback?${callbackParams.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        return (await response.json()) as { jwt?: string };
      })
      .then(({ jwt }) => {
        if (!jwt) {
          throw new Error('NotifyComp did not return a remote session token.');
        }

        setNotifyCompRemoteToken(jwt);
        setToken(jwt);

        const nextParams = new URLSearchParams(location.search);
        nextParams.delete('code');
        const query = nextParams.toString();
        const fallbackPath = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
        const redirectPath = consumeNotifyCompRemoteRedirectPath() || fallbackPath;
        navigate(redirectPath, { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to sign in to NotifyComp Remote.');
        clearNotifyCompRemoteToken();
        setToken(null);
        consumeNotifyCompRemoteRedirectPath();
      })
      .finally(() => {
        setAuthenticating(false);
      });
  }, [location, navigate]);

  const claims = token ? getNotifyCompRemoteClaims() : null;

  const value = useMemo(
    () => ({
      authenticating,
      error,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
      userName: claims?.name,
    }),
    [authenticating, claims?.name, error, signIn, signOut, token],
  );

  return (
    <NotifyCompRemoteAuthContext.Provider value={value}>
      {children}
    </NotifyCompRemoteAuthContext.Provider>
  );
}
