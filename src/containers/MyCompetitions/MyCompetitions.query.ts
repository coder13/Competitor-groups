import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { usePinnedCompetitions } from '@/hooks/UsePinnedCompetitions';
import { fetchUserWithCompetitions, UserCompsResponse } from '@/lib/api';
import { FIVE_MINUTES } from '@/lib/constants';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';

export const useMyCompetitionsQuery = (userId?: number, options: { enabled?: boolean } = {}) => {
  const { data, ...props } = useQuery<UserCompsResponse, string>({
    queryKey: ['userCompetitions', userId],
    queryFn: async () => {
      const res = await fetchUserWithCompetitions(userId!.toString());

      setLocalStorage('my.upcoming_competitions', JSON.stringify(res.upcoming_competitions));
      setLocalStorage('my.ongoing_competitions', JSON.stringify(res.ongoing_competitions));

      return res;
    },
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES,
    enabled: Boolean(userId && (options.enabled ?? true)),
    initialData: () => {
      const user = JSON.parse(getLocalStorage('user') || 'null') as User;
      if (user?.id !== userId) {
        return undefined;
      }

      const rawUpcomingCompetitions = getLocalStorage('my.upcoming_competitions');
      const rawOngoingCompetitions = getLocalStorage('my.ongoing_competitions');
      if (!rawUpcomingCompetitions && !rawOngoingCompetitions) {
        return undefined;
      }

      const upcoming_competitions = JSON.parse(rawUpcomingCompetitions || '[]') as ApiCompetition[];
      const ongoing_competitions = JSON.parse(rawOngoingCompetitions || '[]') as ApiCompetition[];

      if (!upcoming_competitions.length && !ongoing_competitions.length) {
        return undefined;
      }

      return { user: user, upcoming_competitions, ongoing_competitions };
    },
    networkMode: 'offlineFirst',
  });

  const { pinnedCompetitions } = usePinnedCompetitions();

  const competitions = useMemo(
    () =>
      [...(data?.upcoming_competitions || []), ...(data?.ongoing_competitions || [])]
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .filter((c) => !pinnedCompetitions.some((pinned) => pinned.id === c.id)),
    [data?.ongoing_competitions, data?.upcoming_competitions, pinnedCompetitions],
  );

  return {
    ...props,
    pinnedCompetitions,
    competitions,
  };
};
