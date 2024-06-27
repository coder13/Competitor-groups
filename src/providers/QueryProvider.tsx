import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  persistQueryClient,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PropsWithChildren } from 'react';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  retry: removeOldestQuery,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
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
