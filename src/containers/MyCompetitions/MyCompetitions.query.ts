import { useQuery } from '@tanstack/react-query';
import { fetchUserWithCompetitions, UserCompsResponse } from '../../lib/api';
import { FIVE_MINUTES } from '../../lib/constants';
import { useMemo } from 'react';
import { usePinnedCompetitions } from '../../hooks/UsePinnedCompetitions';
import { getLocalStorage, setLocalStorage } from '../../lib/localStorage';

export const useMyCompetitionsQuery = (userId?: number) => {
  const { data, ...props } = useQuery<UserCompsResponse, string>({
    queryKey: ['userCompetitions'],
    queryFn: async () => {
      const res = await fetchUserWithCompetitions(userId!.toString());

      setLocalStorage('my.upcoming_competitions', JSON.stringify(res.upcoming_competitions));
      setLocalStorage('my.ongoing_competitions', JSON.stringify(res.ongoing_competitions));

      return res;
    },
    gcTime: FIVE_MINUTES,
    enabled: !!userId,
    initialData: () => {
      const user = JSON.parse(getLocalStorage('user') || 'null') as User;
      const upcoming_competitions = JSON.parse(
        getLocalStorage('my.upcoming_competitions') || '[]'
      ) as ApiCompetition[];
      const ongoing_competitions = JSON.parse(
        getLocalStorage('my.ongoing_competitions') || '[]'
      ) as ApiCompetition[];

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
    [data?.ongoing_competitions, data?.upcoming_competitions]
  );

  return {
    ...props,
    pinnedCompetitions,
    competitions,
  };
};
