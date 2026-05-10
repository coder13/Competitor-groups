import { useQuery } from '@tanstack/react-query';
import { fetchCompetitionResults } from '@/lib/api';

export const useWcaCompetitionResults = (
  competitionId: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    enabled: Boolean(competitionId) && (options.enabled ?? true),
    queryKey: ['wca/competition-results', competitionId],
    queryFn: () => fetchCompetitionResults(competitionId!),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
