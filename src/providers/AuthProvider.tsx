import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID, WCA_OAUTH_ORIGIN } from '../lib/wca-env';
import history from '../lib/history';
import { fetchMe } from '../lib/api';
import { queryClient } from './QueryProvider';
import { getLocalStorage, localStorageKey, setLocalStorage } from '../lib/localStorage';

/**
 * Allows for use of staging api in production
 */
const oauthRedirectUri = () => {
  const appUri = window.location.origin;
  const searchParams = new URLSearchParams(window.location.search);
  const stagingParam = searchParams.has('staging');
  return stagingParam ? `${appUri}?staging=true` : appUri;
};

interface IAuthContext {
  accessToken: string | null;
  signIn: () => void;
  signOut: () => void;
  signedIn: () => boolean;
  user: User | null;
  setUser: (user: User) => void;
  expired: boolean;
}

const AuthContext = createContext<IAuthContext>({
  accessToken: null,
  signIn: () => {},
  signOut: () => {},
  signedIn: () => false,
  user: null,
  setUser: () => {},
  expired: true,
});

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getLocalStorage('accessToken'));
  // const [expirationTime, setExpirationTime] = useState<string | null>(
  //   getLocalStorage('expirationTime')
  // ); // Time at which it expires
  const [user, setUser] = useState<User | null>(() => {
    const rawUserData = getLocalStorage('user');
    return rawUserData ? (JSON.parse(rawUserData) as User) : null;
  });

  const location = useLocation();
  const navigate = useNavigate();

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

  const signOut = () => {
    console.log('signing out');
    setAccessToken(null);

    setUser(null);
    localStorage.removeItem(localStorageKey('accessToken'));
    localStorage.removeItem(localStorageKey('expirationTime'));
    localStorage.removeItem(localStorageKey('user'));
    localStorage.removeItem(localStorageKey('my.upcoming_competitions'));
    localStorage.removeItem(localStorageKey('my.ongoing_competitions'));
  };

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    const hashParamAccessToken = hashParams.get('access_token');
    if (!hashParamAccessToken) {
      return;
    }

    fetchMe(hashParamAccessToken)
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

    setAccessToken(hashParamAccessToken);

    // const hashParamExpiresIn = hashParams.get('expires_in');
    // if (hashParamExpiresIn && !isNaN(parseInt(hashParamExpiresIn, 10))) {
    //   /* Expire the token 15 minutes before it actually does,
    //      this way it doesn't expire right after the user enters the page. */
    //   const expiresInSeconds = parseInt(hashParamExpiresIn, 10) - 15 * 60;
    //   const expTime = new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString();
    //   setLocalStorage('expirationTime', expTime);
    //   setExpirationTime(expTime);
    // }
  }, [location, navigate]);

  const signedIn = useCallback(() => !!accessToken, [accessToken]);

  // const expired = useMemo(() => {
  //   if (!user) {
  //     return false;
  //   }
  //   if (!expirationTime) {
  //     return true;
  //   }

  //   return Date.now() >= new Date(expirationTime).getTime();
  // }, [user, expirationTime]);

  const setUserAndSave = (user: User) => {
    setLocalStorage('user', JSON.stringify(user));
    setUser(user);
  };

  const value = {
    accessToken,
    user,
    setUser: setUserAndSave,
    signIn,
    signOut,
    signedIn,
    expired: !user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
