import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { deleteLocalStorage, getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import {
  clearNotifyCompRemoteToken,
  getNotifyCompRemoteClaims,
  getNotifyCompRemoteToken,
  hasNotifyCompRemoteTokenForCompetition,
  setNotifyCompRemoteToken,
} from '@/lib/notifyCompRemoteAuth';
import { getStoredWcaAccessToken } from '@/lib/wcaAccessToken';
import { useAuth } from '../AuthProvider';
import { NotifyCompRemoteAuthContext } from './NotifyCompRemoteAuthContext';

const NOTIFY_COMP_TOKEN_URL = '/.netlify/functions/notify-comp-token';
const PENDING_REMOTE_COMPETITION_ID_KEY = 'notifyComp.pendingRemoteCompetitionId';
const REMOTE_SCOPE = 'notifycomp.remote';

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
  const { signIn: signInWithWca, user } = useAuth();

  const signIn = useCallback(
    async (competitionId: string) => {
      setError(null);
      const accessToken = getStoredWcaAccessToken();

      if (!accessToken) {
        setLocalStorage(PENDING_REMOTE_COMPETITION_ID_KEY, competitionId);
        signInWithWca();
        return;
      }

      setAuthenticating(true);
      deleteLocalStorage(PENDING_REMOTE_COMPETITION_ID_KEY);

      try {
        const response = await fetch(NOTIFY_COMP_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken,
            competitionId,
            scope: REMOTE_SCOPE,
          }),
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const payload = (await response.json()) as { token?: string };
        if (!payload.token) {
          throw new Error('Remote token response was missing a token.');
        }

        setNotifyCompRemoteToken(payload.token);
        setToken(payload.token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to authorize NotifyComp Remote.');
        clearNotifyCompRemoteToken();
        setToken(null);
      } finally {
        setAuthenticating(false);
      }
    },
    [signInWithWca],
  );

  useEffect(() => {
    const pendingCompetitionId = getLocalStorage(PENDING_REMOTE_COMPETITION_ID_KEY);
    if (!pendingCompetitionId || authenticating || !user) {
      return;
    }

    if (hasNotifyCompRemoteTokenForCompetition(pendingCompetitionId)) {
      deleteLocalStorage(PENDING_REMOTE_COMPETITION_ID_KEY);
      return;
    }

    if (!getStoredWcaAccessToken()) {
      return;
    }

    void signIn(pendingCompetitionId);
  }, [authenticating, signIn, user]);

  const signOut = useCallback(() => {
    clearNotifyCompRemoteToken();
    setToken(null);
  }, []);

  const claims = token ? getNotifyCompRemoteClaims() : null;

  const value = useMemo(
    () => ({
      authenticating,
      error,
      isAuthenticatedForCompetition: hasNotifyCompRemoteTokenForCompetition,
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
