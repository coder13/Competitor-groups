import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers/AuthProvider';
import CompetitionListFragment from '../../components/CompetitionList';
import { setLocalStorage } from '../../lib/localStorage';
import { useEffect, useMemo } from 'react';
import { useCompetitionsQuery } from '../../queries';
import { wcaApiFetch } from '../../hooks/useWCAFetch';
import { FIVE_MINUTES } from '../../lib/constants';

const params = new URLSearchParams({
  upcoming_competitions: 'true',
  ongoing_competitions: 'true',
});

export interface UserCompsResponse {
  upcoming_competitions: ApiCompetition[];
  ongoing_competitions: ApiCompetition[];
}

export function MyCompetitions() {
  const { user, expired, signIn } = useAuth();

  const { data, fetchStatus, dataUpdatedAt } = useQuery<UserCompsResponse, string>({
    queryKey: ['userCompetitions'],
    queryFn: async () =>
      await wcaApiFetch<UserCompsResponse>(`/users/${user?.id}?${params.toString()}`),
    gcTime: FIVE_MINUTES,
    enabled: !!user,
    networkMode: 'offlineFirst',
  });

  const competitions = useMemo(
    () =>
      [...(data?.upcoming_competitions || []), ...(data?.ongoing_competitions || [])].sort(
        (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ),
    [data?.ongoing_competitions, data?.upcoming_competitions]
  );

  const { data: NotifyCompetitions } = useCompetitionsQuery();

  useEffect(() => {
    if (!data) {
      return;
    }

    setLocalStorage('my.upcoming_competitions', JSON.stringify(data.upcoming_competitions));
    setLocalStorage('my.ongoing_competitions', JSON.stringify(data.ongoing_competitions));
  }, [data]);

  return (
    <>
      {expired && (
        <button
          onClick={() => signIn()}
          className="flex flex-col bg-orange-200 w-full rounded my-2 text-sm hover:underline text-left p-2 shadow hover:opacity-80">
          <span className="text-base">Session Expired</span>
          <span className="text-sm">Sign in again to refresh your competitions</span>
        </button>
      )}
      <CompetitionListFragment
        title="Your Upcoming Competitions"
        competitions={competitions}
        loading={fetchStatus === 'fetching'}
        liveCompetitionIds={NotifyCompetitions?.competitions?.map((c) => c.id) || []}
        lastFetchedAt={dataUpdatedAt}
      />
    </>
  );
}
