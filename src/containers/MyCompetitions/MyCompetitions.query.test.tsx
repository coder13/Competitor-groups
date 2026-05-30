import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { fetchUserWithCompetitions } from '@/lib/api';
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
  const storage = new Map<string, string>();

  return {
    getLocalStorage: jest.fn((key: string) => storage.get(key) ?? null),
    setLocalStorage: jest.fn((key: string, value: string) => {
      storage.set(key, value);
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
