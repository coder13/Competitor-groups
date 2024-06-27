import { useQuery } from '@tanstack/react-query';
import { wcaApiFetch } from '../useWCAFetch';
import { queryClient } from '../../providers/QueryProvider';

export const competitionQuery = (competitionId: string) => ({
  queryKey: ['competition', competitionId],
  queryFn: async () => wcaApiFetch<ApiCompetition>(`/competitions/${competitionId}`),
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
