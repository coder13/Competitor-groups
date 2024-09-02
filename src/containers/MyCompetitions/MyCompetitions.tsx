import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../providers/AuthProvider';
import CompetitionListFragment from '../../components/CompetitionList';
import { setLocalStorage } from '../../lib/localStorage';
import { useEffect, useMemo } from 'react';
import { useCompetitionsQuery } from '../../queries';
import { fetchUserWithCompetitions, UserCompsResponse } from '../../lib/api';
import { FIVE_MINUTES } from '../../lib/constants';
import { usePinnedCompetitions } from '../../hooks/UsePinnedCompetitions';

export function MyCompetitions() {
  const { user, expired, signIn } = useAuth();

  const { data } = useQuery<UserCompsResponse, string>({
    queryKey: ['userCompetitions'],
    queryFn: () => fetchUserWithCompetitions(user!.id.toString()),
    gcTime: FIVE_MINUTES,
    enabled: !!user?.id,
    networkMode: 'offlineFirst',
  });

  const { pinnedCompetitions } = usePinnedCompetitions();

  const competitions = useMemo(
    () =>
      [...(data?.upcoming_competitions || []), ...(data?.ongoing_competitions || [])]
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .filter((c) => !pinnedCompetitions.some((pinned) => pinned.id === c.id)),
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

  if (!user) {
    return null;
  }

  return (
    <>
      <CompetitionListFragment
        title="Your Competitions"
        competitions={[...pinnedCompetitions, ...competitions]}
        loading={false}
        liveCompetitionIds={NotifyCompetitions?.competitions?.map((c) => c.id) || []}
      />
      {expired && (
        <div className="px-2">
          <button
            onClick={() => signIn()}
            className="flex flex-col bg-orange-200 w-full rounded my-2 text-sm hover:underline text-left p-2 shadow hover:opacity-80">
            <span className="text-base">Session Expired</span>
            <span className="text-sm">Sign in again to refresh your competitions</span>
          </button>
        </div>
      )}
    </>
  );
}
