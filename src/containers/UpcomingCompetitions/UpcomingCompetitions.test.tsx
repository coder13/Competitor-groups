import { render, screen } from '@testing-library/react';
import { useInfiniteCompetitions } from '@/hooks/queries/useInfiniteCompetitions';
import UpcomingCompetitions from './UpcomingCompetitions';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('react-intersection-observer', () => ({ useInView: () => ({ inView: false }) }));
jest.mock('@/providers/AppProvider', () => ({ useApp: () => ({ online: true }) }));
jest.mock('@/hooks/queries/useInfiniteCompetitions', () => ({
  useInfiniteCompetitions: jest.fn(),
}));
jest.mock('@/queries', () => ({ useCompetitionsQuery: () => ({}) }));
jest.mock('@/components', () => ({
  NoteBox: () => null,
  LastFetchedAt: ({ lastFetchedAt }: { lastFetchedAt: Date }) => (
    <div>Fetched at {lastFetchedAt.toISOString()}</div>
  ),
  CompetitionListFragment: () => null,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
it('omits the last-fetched timestamp until data has actually arrived and preserves it during refresh', () => {
  Object.assign(globalThis, { __GIT_COMMIT__: 'test' });
  const mockQuery = jest.mocked(useInfiniteCompetitions);
  mockQuery.mockReturnValue({ dataUpdatedAt: 0, status: 'pending' } as ReturnType<
    typeof useInfiniteCompetitions
  >);
  const { rerender } = render(<UpcomingCompetitions />);
  expect(screen.queryByText(/Fetched at/)).not.toBeInTheDocument();
  mockQuery.mockReturnValue({ dataUpdatedAt: 1793718000000, status: 'success' } as ReturnType<
    typeof useInfiniteCompetitions
  >);
  rerender(<UpcomingCompetitions />);
  expect(screen.getByText(/Fetched at 2026/)).toBeInTheDocument();
  mockQuery.mockReturnValue({ dataUpdatedAt: 1793718000000, status: 'error' } as ReturnType<
    typeof useInfiniteCompetitions
  >);
  rerender(<UpcomingCompetitions />);
  expect(screen.getByText(/Fetched at 2026/)).toBeInTheDocument();
});
