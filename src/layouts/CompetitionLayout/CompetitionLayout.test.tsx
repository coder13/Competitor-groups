import { QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { useWcif } from '@/hooks/queries/useWcif';
import { fetchWcif } from '@/lib/api';
import { queryClient } from '@/providers/QueryProvider';
import { CompetitionLayout } from './CompetitionLayout';

jest.mock('@/hooks/queries/useWcif', () => ({ useWcif: jest.fn() }));
jest.mock('@/lib/api', () => ({ fetchWcif: jest.fn() }));
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
  Object.assign(globalThis, { __GIT_COMMIT__: 'test' });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWcif.mockReturnValue({
    data: undefined,
    error: null,
    dataUpdatedAt: 0,
    isFetching: true,
    isPlaceholderData: false,
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

describe('with actual WCIF query state', () => {
  const { useWcif: useActualWcif } = jest.requireActual<{
    useWcif: typeof useWcif;
  }>('@/hooks/queries/useWcif');
  const competitionId = 'Example2026';
  const competition = {
    id: competitionId,
    name: 'Example 2026',
    shortName: 'Example 2026',
    formatVersion: '2.2',
    events: [],
    persons: [],
    schedule: {
      numberOfDays: 1,
      startDate: '2026-11-03',
      venues: [
        {
          id: 1,
          name: 'Venue',
          latitudeMicrodegrees: 0,
          longitudeMicrodegrees: 0,
          countryIso2: 'US',
          timezone: 'Etc/UTC',
          extensions: [],
          rooms: [
            {
              id: 1,
              name: 'Main room',
              color: '#ffffff',
              extensions: [],
              activities: [
                {
                  id: 42,
                  activityCode: '333-r1',
                  name: '3x3x3 Cube, Round 1',
                  startTime: '2026-11-03T09:00:00Z',
                  endTime: '2026-11-03T10:00:00Z',
                  childActivities: [],
                  extensions: [],
                  scrambleSetId: null,
                },
              ],
            },
          ],
        },
      ],
    },
    series: null,
    registrationInfo: {
      openTime: '2026-10-01T00:00:00Z',
      closeTime: '2026-11-01T00:00:00Z',
      baseEntryFee: 1000,
      currencyCode: 'USD',
      onTheSpotRegistration: false,
      useWcaRegistration: true,
    },
    competitorLimit: 100,
    extensions: [],
  } satisfies Competition;

  function ActivityContent() {
    const { competitionId, activityId } = useParams();
    const { data } = useWcif(competitionId);
    const activity = data?.schedule.venues
      .flatMap((venue) => venue.rooms)
      .flatMap((room) => room.activities)
      .find((activity) => activity.id === Number(activityId));

    return <h2>{activity?.name ?? 'Activity not found'}</h2>;
  }

  const activityView = (activityId = 42) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/competitions/${competitionId}/activities/${activityId}`]}>
        <Routes>
          <Route path="/competitions/:competitionId" element={<CompetitionLayout />}>
            <Route path="activities/:activityId" element={<ActivityContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    mockUseWcif.mockImplementation(useActualWcif);
    jest.mocked(fetchWcif).mockReset();
    queryClient.setQueryData(['upcomingCompetitions'], {
      pages: [[{ id: competitionId, name: 'Example 2026', short_name: 'Example 2026' }]],
      pageParams: [undefined],
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it.each([
    { activityId: 42, expectedHeading: '3x3x3 Cube, Round 1' },
    { activityId: 999, expectedHeading: 'Activity not found' },
  ])(
    'waits for full WCIF before resolving activity $activityId',
    async ({ activityId, expectedHeading }) => {
      let resolveWcif!: (value: Competition) => void;
      jest.mocked(fetchWcif).mockReturnValue(
        new Promise((resolve) => {
          resolveWcif = resolve;
        }),
      );

      render(activityView(activityId));

      expect(mockUseWcif.mock.results[0].value.isPlaceholderData).toBe(true);
      expect(screen.getByRole('status')).toHaveTextContent('common.loading');
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByText('Remote bar')).not.toBeInTheDocument();

      await act(async () => resolveWcif(competition));

      expect(await screen.findByRole('heading', { name: expectedHeading })).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('Remote bar')).toBeInTheDocument();
    },
  );

  it('keeps real cached WCIF visible throughout a background refresh and its failure', async () => {
    queryClient.setQueryData(['wcif', competitionId], competition);
    let rejectWcif!: (error: Error) => void;
    jest.mocked(fetchWcif).mockReturnValue(
      new Promise((_, reject) => {
        rejectWcif = reject;
      }),
    );

    render(activityView());

    expect(mockUseWcif.mock.results[0].value).toMatchObject({
      isFetching: true,
      isPlaceholderData: false,
    });
    expect(screen.getByRole('heading', { name: '3x3x3 Cube, Round 1' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => rejectWcif(new Error('Offline')));

    expect(await screen.findByRole('alert')).toHaveTextContent('competition.refreshError');
    expect(screen.getByRole('heading', { name: '3x3x3 Cube, Round 1' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('competition.loadErrorHint')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.retry' })).toBeEnabled();
  });

  it('offers an actionable initial error and returns to loading until a retry supplies full WCIF', async () => {
    jest.mocked(fetchWcif).mockRejectedValueOnce(new Error('Offline'));
    render(activityView());

    expect(await screen.findByRole('alert')).toHaveTextContent('competition.loadErrorHint');
    expect(screen.getByRole('link', { name: 'common.home' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    let resolveWcif!: (value: Competition) => void;
    jest.mocked(fetchWcif).mockReturnValue(
      new Promise((resolve) => {
        resolveWcif = resolve;
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));

    expect(await screen.findByRole('status')).toHaveTextContent('common.loading');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => resolveWcif(competition));

    expect(await screen.findByRole('heading', { name: '3x3x3 Cube, Round 1' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

it('keeps a loading status for placeholder-only data when fetching is paused', () => {
  mockUseWcif.mockReturnValue({
    data: { persons: [], events: [], schedule: { venues: [] } },
    error: null,
    dataUpdatedAt: 0,
    isFetching: false,
    isPlaceholderData: true,
    refetch,
  });
  render(view());
  expect(screen.getByRole('status')).toHaveTextContent('common.loading');
  expect(screen.queryByText('Competition content')).not.toBeInTheDocument();
  expect(screen.queryByText('Remote bar')).not.toBeInTheDocument();
});
