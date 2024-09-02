import { useInfiniteQuery } from '@tanstack/react-query';
import { FIVE_MINUTES } from '../../lib/constants';
import { wcaApiFetch } from '../../lib/api';

// This is a magic number constant that comes from the WCA API.
const DEFAULT_WCA_PAGINATION = 25;

const oneWeekAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const oneWeekFuture = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);

export const useInfiniteCompetitions = () =>
  useInfiniteQuery<CondensedApiCompetiton[], string>({
    queryKey: ['upcomingCompetitions'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        start: oneWeekAgo.toISOString().split('T')[0],
        end: oneWeekFuture.toISOString().split('T')[0],
        sort: 'start_date',
        ...(pageParam
          ? {
              page: pageParam.toString(),
            }
          : {}),
      });

      return wcaApiFetch<ApiCompetition[]>(`/competitions?${params.toString()}`);
    },
    getNextPageParam: (lastPage, pages) => {
      // If we have more pages, keep going
      if (lastPage.length === DEFAULT_WCA_PAGINATION) {
        return pages.length + 1;
      }

      // Otherwise, we're done
      return undefined;
    },
    networkMode: 'offlineFirst',
    gcTime: FIVE_MINUTES,
    initialPageParam: 1,
  });
