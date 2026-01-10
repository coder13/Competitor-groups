import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface UserSettingsContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

export const UserSettingsContext = createContext<UserSettingsContextProps>({
  theme: 'system',
  setTheme: () => {},
  effectiveTheme: 'light',
});

export const useUserSettings = () => useContext(UserSettingsContext);
