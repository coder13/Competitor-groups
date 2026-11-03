import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useWcif } from '@/hooks/queries/useWcif';
import { CompetitionLayout } from './CompetitionLayout';

jest.mock('@/hooks/queries/useWcif', () => ({ useWcif: jest.fn() }));
jest.mock('@/hooks/useCompetitionAnalytics', () => ({ useCompetitionAnalytics: jest.fn() }));
jest.mock('@/providers/AppProvider', () => ({ useApp: () => ({ online: true }) }));
jest.mock('@/providers/WCIFProvider', () => ({
  WCIFProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('./CompetitionLayout.tabs', () => ({ useCompetitionLayoutTabs: () => ({ tabs: [] }) }));
jest.mock('@/components', () => ({
  ErrorFallback: () => <div>Render failed</div>,
  LastFetchedAt: () => <div>Last fetched</div>,
  NoteBox: () => null,
  NotifyCompRemoteBar: () => <div>Remote bar</div>,
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const mockUseWcif = useWcif as jest.Mock;
const refetch = jest.fn();
const view = () => (
  <MemoryRouter initialEntries={['/competitions/Missing2026']}>
    <Routes>
      <Route path="/competitions/:competitionId" element={<CompetitionLayout />}>
        <Route index element={<div>Competition content</div>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

beforeAll(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWcif.mockReturnValue({
    data: undefined,
    error: null,
    dataUpdatedAt: 0,
    isFetching: true,
    refetch,
  });
});

it('does not mount competition content while initial data is loading', () => {
  render(view());
  expect(screen.queryByText('Competition content')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('Remote bar')).not.toBeInTheDocument();
});

it('shows an actionable error after an asynchronous initial failure', () => {
  const { rerender } = render(view());
  mockUseWcif.mockReturnValue({
    error: new Error('Raw HTML response'),
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  rerender(view());
  expect(screen.getByRole('alert')).toHaveTextContent('competition.loadErrorHint');
  expect(screen.queryByText('Raw HTML response')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'common.home' })).toHaveAttribute('href', '/');
  fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Competition content')).not.toBeInTheDocument();
});

it('renders a successful competition even when its people list is empty', () => {
  mockUseWcif.mockReturnValue({
    data: { persons: [] },
    error: null,
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  render(view());
  expect(screen.getByText('Competition content')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('keeps cached content visible on refresh failure and disables retry while fetching', () => {
  mockUseWcif.mockReturnValue({
    data: { persons: [] },
    error: new Error('Offline'),
    dataUpdatedAt: 0,
    isFetching: true,
    refetch,
  });
  render(view());
  expect(screen.getByText('Competition content')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('competition.refreshError');
  expect(screen.queryByText('competition.loadErrorHint')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'common.retry' })).toBeDisabled();
});

it('replaces an initial error with content after a successful retry', () => {
  mockUseWcif.mockReturnValue({
    error: new Error('Offline'),
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  const { rerender } = render(view());
  mockUseWcif.mockReturnValue({
    data: { persons: [] },
    error: null,
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  rerender(view());
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByText('Competition content')).toBeInTheDocument();
});

it('announces initial loading and retry loading even when the query clears its previous error', () => {
  const { rerender } = render(view());
  expect(screen.getByRole('status')).toHaveTextContent('common.loading');
  mockUseWcif.mockReturnValue({
    error: new Error('Missing'),
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  rerender(view());
  fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
  mockUseWcif.mockReturnValue({ error: null, dataUpdatedAt: 0, isFetching: true, refetch });
  rerender(view());
  expect(screen.getByRole('status')).toHaveTextContent('common.loading');
  expect(screen.queryByText('Competition content')).not.toBeInTheDocument();
  mockUseWcif.mockReturnValue({
    error: new Error('Missing'),
    dataUpdatedAt: 0,
    isFetching: false,
    refetch,
  });
  rerender(view());
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'common.retry' })).toBeEnabled();
});
