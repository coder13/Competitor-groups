import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID } from '../lib/wca-env';
import history from '../lib/history';

const localStorageKey = (key: string) => `wca_gantt_chart.${WCA_OAUTH_CLIENT_ID}.${key}`;

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
}

const AuthContext = createContext<IAuthContext>({
  accessToken: null,
  signIn: () => {},
  signOut: () => {},
  signedIn: () => false,
  user: null,
});

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getLocalStorage('accessToken'));
  const [expirationTime, setExpirationTime] = useState(getLocalStorage('expirationTime')); // Time at which it expires
  const [user, setUser] = useState<User | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const signOutIfExpired = useCallback(() => {
    if (expirationTime && new Date() >= new Date(expirationTime)) {
      signOut();
      return true;
    }
  }, [expirationTime]);

  const signIn = () => {
    window.localStorage.setItem('redirect', window.location.pathname);

    const params = new URLSearchParams({
      client_id: WCA_OAUTH_CLIENT_ID,
      response_type: 'token',
      redirect_uri: oauthRedirectUri(),
      scope: 'public',
      state: 'foobar',
    });

    window.location.href = `${WCA_ORIGIN}/oauth/authorize?${params.toString()}`;
  };

  const signOut = () => {
    console.log('signing out');
    setAccessToken(null);
    setExpirationTime(null);
    setUser(null);
    localStorage.removeItem(localStorageKey('accessToken'));
    localStorage.removeItem(localStorageKey('expirationTime'));
  };

  useEffect(() => {
    if (!expirationTime) {
      return;
    }

    if (signOutIfExpired()) {
      return;
    }

    const expiresInMillis = new Date(expirationTime).getTime() - Date.now() + 1000;

    const timeout = setTimeout(() => {
      signOutIfExpired();
    }, expiresInMillis);

    return () => {
      clearTimeout(timeout);
    };
  }, [expirationTime, signOutIfExpired]);

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
      setLocalStorage(
        'expirationTime',
        new Date(new Date().getTime() + expiresInSeconds * 1000).toISOString()
      );
    }

    /* Clear the hash if there is a token. */
    if (hashParamAccessToken) {
      history.replace({ ...history.location, hash: undefined });
      navigate(window.localStorage.getItem('redirect') || '/');
    }
  }, [location, navigate]);

  useEffect(
    () => () => {
      signOutIfExpired();
    },
    [signOutIfExpired]
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetch(
      `${WCA_ORIGIN}/api/v0/me`,
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
      .then((data) => setUser(data.me))
      .catch((err) => console.error(err));
  }, [accessToken]);

  const signedIn = useCallback(() => !!accessToken, [accessToken]);

  const value = { accessToken, user, signIn, signOut, signedIn };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
