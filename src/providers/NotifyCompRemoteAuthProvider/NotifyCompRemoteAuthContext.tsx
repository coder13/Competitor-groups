import { createContext, useContext } from 'react';

export interface NotifyCompRemoteAuthContextValue {
  authenticating: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  userName?: string;
}

export const NotifyCompRemoteAuthContext = createContext<NotifyCompRemoteAuthContextValue>({
  authenticating: false,
  error: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: () => {},
});

export const useNotifyCompRemoteAuth = () => useContext(NotifyCompRemoteAuthContext);
