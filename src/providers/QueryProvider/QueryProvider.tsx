import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client';
import { PropsWithChildren } from 'react';
import { FIVE_MINUTES } from '@/lib/constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: FIVE_MINUTES,
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  retry: removeOldestQuery,
});

export function QueryProvider(props: PropsWithChildren) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}>
      {props.children}
    </PersistQueryClientProvider>
  );
}
