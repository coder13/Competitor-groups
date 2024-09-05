import { createContext, useContext } from 'react';

export interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  user: User | null;
  setUser: (user: User) => void;
  signInAs: (userId: number) => void;
}

export const AuthContext = createContext<IAuthContext>({
  signIn: () => {},
  signOut: () => {},
  user: null,
  setUser: () => {},
  signInAs: () => {},
});

export const useAuth = () => useContext(AuthContext);
