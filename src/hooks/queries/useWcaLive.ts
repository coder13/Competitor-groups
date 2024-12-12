import { useQuery } from '@tanstack/react-query';

export const useWcaLiveCompetitionLink = (competitionId: string) => {
  return useQuery({
    retry: false,
    queryKey: ['wca-live/competition-link', competitionId],
    queryFn: async () => {
      const response = await fetch(
        `https://live.worldcubeassociation.org/link/competitions/${competitionId}`
      );
      if (!response.ok && response.status === 404) {
        const { errors } = (await response.json()) as {
          errors: {
            detail: string;
          };
        };
        throw new Error(errors.detail);
      }
      return response.url;
    },
  });
};

export const useWcaLiveCompetitorLink = (competitionId: string, competitorId: string) => {
  return useQuery({
    retry: false,
    queryKey: ['wca-live/competition-competitor-link', competitionId, competitorId],
    queryFn: async () => {
      const response = await fetch(
        `https://live.worldcubeassociation.org/link/competitions/${competitionId}/competitors/${competitorId}`
      );
      if (!response.ok && response.status === 404) {
        const { errors } = (await response.json()) as {
          errors: {
            detail: string;
          };
        };
        throw new Error(errors.detail);
      }
      return response.url;
    },
  });
};
