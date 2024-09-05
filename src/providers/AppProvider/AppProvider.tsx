import { PropsWithChildren, useEffect, useState } from 'react';
import { AppContext } from './AppContext';

export function AppProvider({ children }: PropsWithChildren) {
  const [online, setOnline] = useState(navigator.onLine);

  const handleOnline = () => {
    setOnline(true);
  };

  const handleOffline = () => {
    setOnline(false);
  };

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        online,
      }}>
      {children}
    </AppContext.Provider>
  );
}
