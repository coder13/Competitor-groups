import { QueryClient, dehydrate, useIsRestoring } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryProvider, queryClient } from './QueryProvider';

function RestoreStatus() {
  return <span>{useIsRestoring() ? 'restoring' : 'ready'}</span>;
}

describe('persisted WCIF cache', () => {
  afterEach(() => {
    queryClient.clear();
    window.localStorage.clear();
  });

  it.each([
    { buster: '', restored: false },
    { buster: 'wcif-v2', restored: true },
  ])('restores only v2-compatible data (buster: $buster)', async ({ buster, restored }) => {
    const previousClient = new QueryClient();
    const data = { formatVersion: restored ? '2.2' : '1.0' };
    previousClient.setQueryData(['wcif', 'Example2026'], data);
    window.localStorage.setItem(
      'REACT_QUERY_OFFLINE_CACHE',
      JSON.stringify({ timestamp: Date.now(), buster, clientState: dehydrate(previousClient) }),
    );

    render(
      <QueryProvider>
        <RestoreStatus />
      </QueryProvider>,
    );
    await waitFor(() => expect(screen.getByText('ready')).toBeInTheDocument());

    expect(queryClient.getQueryData(['wcif', 'Example2026'])).toEqual(restored ? data : undefined);
    previousClient.clear();
  });
});
