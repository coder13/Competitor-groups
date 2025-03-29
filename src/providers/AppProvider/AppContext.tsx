import { createContext, useContext } from 'react';

export interface AppContextProps {
  online: boolean;
}

export const AppContext = createContext<AppContextProps>({
  online: true,
});

export const useApp = () => useContext(AppContext);
