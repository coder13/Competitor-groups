import { dehydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { fetchUserWithCompetitions, UserCompsResponse } from '@/lib/api';
import { QueryProvider, queryClient } from '@/providers/QueryProvider';
import { useMyCompetitionsQuery } from './MyCompetitions.query';

jest.mock('@/hooks/UsePinnedCompetitions', () => ({
  usePinnedCompetitions: () => ({
    pinnedCompetitions: [],
  }),
}));

jest.mock('@/lib/api', () => ({
  fetchUserWithCompetitions: jest.fn(),
}));

jest.mock('@/lib/localStorage', () => {
  return {
    getLocalStorage: jest.fn((key: string) => window.localStorage.getItem(key)),
    setLocalStorage: jest.fn((key: string, value: string) => {
      window.localStorage.setItem(key, value);
    }),
  };
});

const user = { id: 13, name: 'Cailyn Sinclair' } as User;
const upcomingCompetition = {
  id: 'KentSpring2026',
  name: 'Kent Spring 2026',
  city: 'Kent, Washington',
  country_iso2: 'US',
  start_date: '2026-05-30',
  end_date: '2026-05-30',
} as ApiCompetition;
const ongoingCompetition = {
  id: 'OngoingOpen2026',
  name: 'Ongoing Open 2026',
  city: 'Seattle, Washington',
  country_iso2: 'US',
  start_date: '2026-05-29',
  end_date: '2026-05-30',
} as ApiCompetition;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

afterEach(() => {
  queryClient.clear();
  window.localStorage.clear();
});

it('loads my competitions from the public user competitions endpoint', async () => {
  jest.mocked(fetchUserWithCompetitions).mockResolvedValue({
    user,
    upcoming_competitions: [upcomingCompetition],
    ongoing_competitions: [ongoingCompetition],
  });

  const { result } = renderHook(() => useMyCompetitionsQuery(user.id), {
    wrapper: createWrapper(),
  });

  await waitFor(() =>
    expect(result.current.competitions).toEqual([ongoingCompetition, upcomingCompetition]),
  );

  expect(fetchUserWithCompetitions).toHaveBeenCalledWith(String(user.id));
});

it('uses cached competitions as stale startup data and still refetches', async () => {
  const { setLocalStorage } = jest.requireMock('@/lib/localStorage') as {
    setLocalStorage: (key: string, value: string) => void;
  };

  setLocalStorage('user', JSON.stringify(user));
  setLocalStorage('my.upcoming_competitions', JSON.stringify([upcomingCompetition]));
  setLocalStorage('my.ongoing_competitions', JSON.stringify([]));
  jest.mocked(fetchUserWithCompetitions).mockResolvedValue({
    user,
    upcoming_competitions: [],
    ongoing_competitions: [ongoingCompetition],
  });

  const { result } = renderHook(() => useMyCompetitionsQuery(user.id), {
    wrapper: createWrapper(),
  });

  expect(result.current.competitions).toEqual([upcomingCompetition]);

  await waitFor(() => expect(result.current.competitions).toEqual([ongoingCompetition]));
  expect(fetchUserWithCompetitions).toHaveBeenCalledWith(String(user.id));
});

it.each([
  { name: 'empty', cachedCompetitions: [] },
  { name: 'populated', cachedCompetitions: [upcomingCompetition] },
])(
  'refreshes a fresh $name persisted cache while keeping its data visible',
  async ({ cachedCompetitions }) => {
    const reloadedUser = { ...user, id: 8184 };
    const previousClient = new QueryClient();
    previousClient.setQueryData(['userCompetitions', reloadedUser.id], {
      user: reloadedUser,
      upcoming_competitions: cachedCompetitions,
      ongoing_competitions: [],
    });
    window.localStorage.setItem('user', JSON.stringify(reloadedUser));
    window.localStorage.setItem(
      'REACT_QUERY_OFFLINE_CACHE',
      JSON.stringify({
        timestamp: Date.now(),
        buster: 'wcif-v2',
        clientState: dehydrate(previousClient),
      }),
    );
    previousClient.clear();
    let resolveResponse!: (response: UserCompsResponse) => void;
    jest.mocked(fetchUserWithCompetitions).mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      }),
    );

    const { result } = renderHook(() => useMyCompetitionsQuery(reloadedUser.id), {
      wrapper: QueryProvider,
    });

    await waitFor(() => expect(fetchUserWithCompetitions).toHaveBeenCalledWith('8184'));
    expect(result.current.competitions).toEqual(cachedCompetitions);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      resolveResponse({
        user: reloadedUser,
        upcoming_competitions: [],
        ongoing_competitions: [ongoingCompetition],
      });
    });

    await waitFor(() => expect(result.current.competitions).toEqual([ongoingCompetition]));
  },
);

it('refreshes again on a return visit even when the previous request is still fresh', async () => {
  const wrapper = createWrapper();
  jest.mocked(fetchUserWithCompetitions).mockResolvedValueOnce({
    user,
    upcoming_competitions: [upcomingCompetition],
    ongoing_competitions: [],
  });

  const firstVisit = renderHook(() => useMyCompetitionsQuery(user.id), { wrapper });
  await waitFor(() =>
    expect(firstVisit.result.current.competitions).toEqual([upcomingCompetition]),
  );
  firstVisit.unmount();

  let resolveResponse!: (response: UserCompsResponse) => void;
  jest.mocked(fetchUserWithCompetitions).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveResponse = resolve;
    }),
  );
  const returnVisit = renderHook(() => useMyCompetitionsQuery(user.id), { wrapper });

  await waitFor(() => expect(fetchUserWithCompetitions).toHaveBeenCalledTimes(2));
  expect(returnVisit.result.current.competitions).toEqual([upcomingCompetition]);
  expect(returnVisit.result.current.isFetching).toBe(true);

  await act(async () => {
    resolveResponse({
      user,
      upcoming_competitions: [],
      ongoing_competitions: [ongoingCompetition],
    });
  });
  await waitFor(() =>
    expect(returnVisit.result.current.competitions).toEqual([ongoingCompetition]),
  );
});
