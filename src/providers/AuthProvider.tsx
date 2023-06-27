import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID, WCA_OAUTH_ORIGIN } from '../lib/wca-env';
import history from '../lib/history';

const localStorageKey = (key: string) => `competition-groups.${WCA_OAUTH_CLIENT_ID}.${key}`;

const getLocalStorage = (key: string) => localStorage.getItem(localStorageKey(key));
const setLocalStorage = (key: string, value: string) =>
  localStorage.setItem(localStorageKey(key), value);

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
  expired: boolean;
}

const AuthContext = createContext<IAuthContext>({
  accessToken: null,
  signIn: () => {},
  signOut: () => {},
  signedIn: () => false,
  user: null,
  expired: true,
});

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getLocalStorage('accessToken'));
  const [expirationTime, setExpirationTime] = useState<string | null>(
    getLocalStorage('expirationTime')
  ); // Time at which it expires
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
    setExpirationTime(null);
    setUser(null);
    localStorage.removeItem(localStorageKey('accessToken'));
    localStorage.removeItem(localStorageKey('expirationTime'));
    localStorage.removeItem(localStorageKey('user'));
  };

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    const hashParamAccessToken = hashParams.get('access_token');
    if (hashParamAccessToken) {
      setAccessToken(hashParamAccessToken);
      setLocalStorage('accessToken', hashParamAccessToken);
    }

    const hashParamExpiresIn = hashParams.get('expires_in');
    if (hashParamExpiresIn && !isNaN(parseInt(hashParamExpiresIn, 10))) {
      /* Expire the token 15 minutes before it actually does,
         this way it doesn't expire right after the user enters the page. */
      const expiresInSeconds = parseInt(hashParamExpiresIn, 10) - 15 * 60;
      const expTime = new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString();
      setLocalStorage('expirationTime', expTime);
      setExpirationTime(expTime);
    }

    /* Clear the hash if there is a token. */
    if (hashParamAccessToken) {
      history.replace({ ...history.location, hash: undefined });
      navigate(window.localStorage.getItem('redirect') || '/');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetch(
      `${WCA_ORIGIN}/me`,
      Object.assign(
        {},
        {
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }),
        }
      )
    )
      .then((res) => {
        if (res.ok) {
          return res.json() as Promise<{
            me: User;
          }>;
        } else {
          throw res.json();
        }
      })
      .then((data) => {
        setLocalStorage('user', JSON.stringify(data.me));
        setUser(data.me);
      })
      .catch((err) => console.error(err));
  }, [accessToken]);

  const signedIn = useCallback(() => !!accessToken, [accessToken]);

  const expired = useMemo(() => {
    if (!user) {
      return false;
    }
    if (!expirationTime) {
      return true;
    }

    console.log(
      181,
      expirationTime,
      new Date(expirationTime).getTime(),
      Date.now(),
      Date.now() >= new Date(expirationTime).getTime()
    );

    return Date.now() >= new Date(expirationTime).getTime();
  }, [user, expirationTime]);

  const value = {
    accessToken,
    user,
    signIn,
    signOut,
    signedIn,
    expired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
