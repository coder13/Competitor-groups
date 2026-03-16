import { useQuery } from '@tanstack/react-query';
import { fetchCompetitionTabs } from '@/lib/api';

const sortTabsByOrder = (tabs: ApiCompetitionTab[]) =>
  [...tabs].sort((a, b) => a.display_order - b.display_order);

export const competitionTabsQuery = (competitionId: string) => ({
  queryKey: ['competitionTabs', competitionId],
  queryFn: async () => fetchCompetitionTabs(competitionId),
});

export const useCompetitionTabs = (competitionId?: string) => {
  return useQuery<ApiCompetitionTab[]>({
    ...competitionTabsQuery(competitionId ?? ''),
    networkMode: 'offlineFirst',
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!competitionId,
    select: (tabs) => sortTabsByOrder(tabs),
  });
};
