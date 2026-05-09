import { useQuery } from '@tanstack/react-query';

const WCA_LIVE_ORIGIN = 'https://live.worldcubeassociation.org';

export const useWcaLiveCompetitionLink = (competitionId: string) => {
  return useQuery({
    retry: false,
    queryKey: ['wca-live/competition-link', competitionId],
    queryFn: async () => {
      const response = await fetch(`${WCA_LIVE_ORIGIN}/link/competitions/${competitionId}`);
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

export const useWcaLiveCompetitorLink = (
  competitionId: string,
  competitorId: string,
  options: { enabled?: boolean } = {},
) => {
  return useQuery({
    enabled: options.enabled ?? true,
    retry: false,
    queryKey: ['wca-live/competition-competitor-link', competitionId, competitorId],
    queryFn: async () => {
      const response = await fetch(
        `${WCA_LIVE_ORIGIN}/link/competitions/${competitionId}/competitors/${competitorId}`,
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

export interface WcaLiveCompetitorResult {
  id: string;
  ranking: number | null;
  advancing: boolean;
  advancingQuestionable: boolean;
  attempts: {
    result: number;
  }[];
  best: number;
  average: number;
  round: {
    id: string;
    name: string;
    number: number;
    competitionEvent: {
      id: string;
      event: {
        id: string;
        name: string;
        rank: number;
      };
    };
    format: {
      id: string;
      numberOfAttempts: number;
      sortBy: string;
    };
  };
}

interface WcaLiveCompetitorResultsResponse {
  data?: {
    person?: {
      id: string;
      results: WcaLiveCompetitorResult[];
    } | null;
  };
  errors?: {
    message: string;
  }[];
}

const WCA_LIVE_COMPETITOR_RESULTS_QUERY = `
  query Competitor($id: ID!) {
    person(id: $id) {
      id
      results {
        id
        ranking
        advancing
        advancingQuestionable
        attempts {
          result
        }
        best
        average
        round {
          id
          name
          number
          competitionEvent {
            id
            event {
              id
              name
              rank
            }
          }
          format {
            id
            numberOfAttempts
            sortBy
          }
        }
      }
    }
  }
`;

const getCompetitorIdFromWcaLiveUrl = (url: string) => {
  const match = url.match(/\/competitors\/([^/?#]+)/);
  return match?.[1];
};

const fetchWcaLiveCompetitorResults = async (competitorUrl: string) => {
  const competitorId = getCompetitorIdFromWcaLiveUrl(competitorUrl);

  if (!competitorId) {
    throw new Error('Could not resolve WCA Live competitor id.');
  }

  const response = await fetch(`${WCA_LIVE_ORIGIN}/api`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: WCA_LIVE_COMPETITOR_RESULTS_QUERY,
      variables: { id: competitorId },
    }),
  });

  if (!response.ok) {
    throw new Error(`WCA Live results request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as WcaLiveCompetitorResultsResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('\n'));
  }

  return payload.data?.person?.results ?? [];
};

export const useWcaLiveCompetitorResults = (
  competitorUrl: string | undefined,
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    enabled: Boolean(competitorUrl) && (options.enabled ?? true),
    queryKey: ['wca-live/competitor-results', competitorUrl],
    queryFn: () => fetchWcaLiveCompetitorResults(competitorUrl!),
    refetchInterval: 5 * 60 * 1000,
  });
