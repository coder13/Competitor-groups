import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { WCA_ORIGIN, WCA_OAUTH_CLIENT_ID } from '../lib/wca-env';
import history from '../lib/history';

const localStorageKey = key => `wca_gantt_chart.${WCA_OAUTH_CLIENT_ID}.${key}`;

const getLocalStorage = (key) => localStorage.getItem(localStorageKey(key));
const setLocalStorage = (key, value) => localStorage.setItem(localStorageKey(key), value);

/**
 * Allows for use of staging api in production
 */
const oauthRedirectUri = () => {
  const appUri = window.location.origin;
  const searchParams = new URLSearchParams(window.location.search);
  const stagingParam = searchParams.has('staging');
  return stagingParam ? `${appUri}?staging=true` : appUri;
};

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getLocalStorage('accessToken'));
  const [expirationTime, setExpirationTime] = useState(getLocalStorage('expirationTime')); // Time at which it expires

  const location = useLocation();

  const signOutIfExpired = useCallback(() => {
    if (expirationTime && new Date() >= new Date(expirationTime)) {
      signOut();
      return true;
    }
  }, [expirationTime]);

  const signIn = () => {
    const params = new URLSearchParams({
      client_id: WCA_OAUTH_CLIENT_ID,
      response_type: 'token',
      redirect_uri: oauthRedirectUri(),
      scope: 'public manage_competitions email',
      state: 'foobar'
    });
    window.location = `${WCA_ORIGIN}/oauth/authorize?${params.toString()}`;
  };

  const signOut = () => {
    console.log('signing out')
    setAccessToken(null);
    setExpirationTime(null);
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

    const expiresInMillis = (new Date(expirationTime) - Date.now()) + 1000;

    const timeout = setTimeout(() => {
      signOutIfExpired();
    }, expiresInMillis);

    return () => {
      clearTimeout(timeout);
    }
  }, [expirationTime, signOutIfExpired]);

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    if (hashParams.has('access_token')) {
      setAccessToken(hashParams.get('access_token'));
      setLocalStorage('accessToken', hashParams.get('access_token'));
    }

    if (hashParams.has('expires_in')) {
      /* Expire the token 15 minutes before it actually does,
         this way it doesn't expire right after the user enters the page. */
      const expiresInSeconds = hashParams.get('expires_in') - 15 * 60;
      setLocalStorage('expirationTime', (new Date(
        new Date().getTime() + expiresInSeconds * 1000
      )).toISOString());
    }

    /* Clear the hash if there is a token. */
    if (hashParams.has('access_token')) {
      history.replace({ ...history.location, hash: null });
    }
  }, [location]);

  useEffect(() => () => {
    signOutIfExpired();
  }, [signOutIfExpired])

  const signedIn = useCallback(() => !!accessToken, [accessToken]);

  const value = { accessToken, signIn, signOut, signedIn };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
