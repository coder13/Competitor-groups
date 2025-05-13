import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMe, fetchUserWithCompetitions } from '@/lib/api';
import history from '@/lib/history';
import { getLocalStorage, localStorageKey, setLocalStorage } from '@/lib/localStorage';
import { WCA_OAUTH_CLIENT_ID, WCA_OAUTH_ORIGIN } from '@/lib/wca-env';
import { queryClient } from '../QueryProvider';
import { AuthContext } from './AuthContext';

/**
 * Allows for use of staging api in production
 */
const oauthRedirectUri = () => {
  const appUri = window.location.origin;
  const searchParams = new URLSearchParams(window.location.search);
  const stagingParam = searchParams.has('staging');
  return stagingParam ? `${appUri}?staging=true` : appUri;
};

const signIn = () => {
  window.localStorage.setItem('redirect', window.location.pathname);

  const params = new URLSearchParams({
    client_id: WCA_OAUTH_CLIENT_ID,
    response_type: 'token',
    redirect_uri: oauthRedirectUri(),
    scope: 'public',
    state: 'foobar',
  });

  window.location.href = `${WCA_OAUTH_ORIGIN}/oauth/authorize?${params.toString()}`;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(() => {
    const rawUserData = getLocalStorage('user');
    return rawUserData ? (JSON.parse(rawUserData) as User) : null;
  });

  const location = useLocation();
  const navigate = useNavigate();

  const signOut = () => {
    console.log('signing out');

    setUser(null);
    localStorage.removeItem(localStorageKey('accessToken'));
    localStorage.removeItem(localStorageKey('expirationTime'));
    localStorage.removeItem(localStorageKey('user'));
    localStorage.removeItem(localStorageKey('my.upcoming_competitions'));
    localStorage.removeItem(localStorageKey('my.ongoing_competitions'));
  };

  const signInAs = useCallback(
    (userId: number) => {
      queryClient
        .getQueryCache()
        .find({
          queryKey: ['userCompetitions'],
        })
        ?.reset();

      fetchUserWithCompetitions(userId.toString()).then(
        ({ user, ongoing_competitions, upcoming_competitions }) => {
          setUser(user);
          queryClient.setQueryData(['userCompetitions'], {
            ongoing_competitions,
            upcoming_competitions,
          });
          navigate('/', { replace: true });
        },
      );
    },
    [navigate],
  );

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get('access_token');
    if (!accessToken) {
      return;
    }

    fetchMe(accessToken)
      .then(({ me, ongoing_competitions, upcoming_competitions }) => {
        setUserAndSave(me);
        queryClient.setQueryData(['userCompetitions'], {
          ongoing_competitions,
          upcoming_competitions,
        });
      })
      .catch((err) => console.error(err));

    /* Clear the hash if there is a token. */
    history.replace({ ...history.location, hash: undefined });
    navigate(window.localStorage.getItem('redirect') || '/');
  }, [location, navigate]);

  const setUserAndSave = (user: User) => {
    setLocalStorage('user', JSON.stringify(user));
    setUser(user);
  };

  const value = {
    user,
    setUser: setUserAndSave,
    signIn,
    signOut,
    signInAs,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
