import { createContext, useContext } from 'react';

export interface NotifyCompRemoteAuthContextValue {
  authenticating: boolean;
  error: string | null;
  isAuthenticatedForCompetition: (competitionId: string) => boolean;
  isAuthenticated: boolean;
  signIn: (competitionId: string) => Promise<void>;
  signOut: () => void;
  userName?: string;
}

export const NotifyCompRemoteAuthContext = createContext<NotifyCompRemoteAuthContextValue>({
  authenticating: false,
  error: null,
  isAuthenticatedForCompetition: () => false,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: () => {},
});

export const useNotifyCompRemoteAuth = () => useContext(NotifyCompRemoteAuthContext);
