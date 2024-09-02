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
      // if (!online) {
      //   const wcaCache = await caches.open('wca');
      //   const responses = await wcaCache.keys();
      //   const comps = responses.filter((request) => request.url.includes('wcif/public'));

      //   const fetchedComps = (
      //     await Promise.all<(Competition & { endDate: Date }) | undefined>(
      //       comps.map(async (request) => {
      //         const response = await wcaCache.match(request);
      //         const c = (await response?.json()) as Competition;
      //         const endDate = new Date(
      //           new Date(c.schedule.startDate).getTime() +
      //             c.schedule.numberOfDays * 1000 * 60 * 60 * 24 +
      //             1000 * 60 * new Date().getTimezoneOffset()
      //         );

      //         wcaCache.delete(request);

      //         if (endDate < oneWeekAgo) {
      //           return;
      //         }
      //         return { ...c, endDate };
      //       })
      //     )
      //   ).filter(Boolean);

      //   return fetchedComps
      //     .map((c) => {
      //       return {
      //         id: c.id,
      //         name: c.name,
      //         country_iso2: c.schedule.venues?.[0].countryIso2 || '',
      //         start_date: c.schedule.startDate,
      //         end_date: c.endDate.toISOString().split('T')[0],
      //         city: '',
      //       };
      //     })
      //     .sort((a, b) => a.start_date.localeCompare(b.start_date));
      // }

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
