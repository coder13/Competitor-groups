import { useQuery } from '@tanstack/react-query';
import { fetchCompetition } from '../../lib/api';
import { queryClient } from '../../providers/QueryProvider/QueryProvider';

export const competitionQuery = (competitionId: string) => ({
  queryKey: ['competition', competitionId],
  queryFn: async () => fetchCompetition(competitionId),
});

export const useCompetition = (competitionId: string) => {
  return useQuery<ApiCompetition>({
    ...competitionQuery(competitionId),
    networkMode: 'offlineFirst',
    gcTime: 1000 * 60 * 5,
  });
};

export const prefetchCompetition = (competitionId: string) => {
  return queryClient.prefetchQuery(competitionQuery(competitionId));
};
