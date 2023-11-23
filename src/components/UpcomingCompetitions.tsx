import { useContext, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import useWCAFetch from '../hooks/useWCAFetch';
import { useInfiniteQuery } from '@tanstack/react-query';
import CompetitionListFragment from './CompetitionList';
import { BarLoader } from 'react-spinners';
import { GlobalStateContext } from '../App';
import NoteBox from './Notebox';
import { Competition } from '@wca/helpers';

// This is a magic number constant that comes from the WCA API.
const DEFAULT_WCA_PAGINATION = 25;

const oneWeekAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const oneWeekFuture = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);

export default function UpcomingCompetitions() {
  const { online } = useContext(GlobalStateContext);
  const { ref, inView } = useInView();

  const wcaApiFetch = useWCAFetch();

  const {
    data: upcomingCompetitions,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    status,
  } = useInfiniteQuery<
    Pick<
      ApiCompetition,
      'name' | 'id' | 'start_date' | 'end_date' | 'city' | 'country_iso2'
    >[]
  >({
    queryKey: ['upcomingCompetitions'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!online) {
        const wcaCache = await caches.open('wca');
        const responses = await wcaCache.keys();
        const comps = responses.filter((request) =>
          request.url.includes('wcif/public')
        );

        const fetchedComps = (
          await Promise.all<(Competition & { endDate: Date }) | undefined>(
            comps.map(async (request) => {
              const response = await wcaCache.match(request);
              const c = (await response?.json()) as Competition;
              const endDate = new Date(
                new Date(c.schedule.startDate).getTime() +
                  c.schedule.numberOfDays * 1000 * 60 * 60 * 24 +
                  1000 * 60 * new Date().getTimezoneOffset()
              );

              wcaCache.delete(request);

              if (endDate < oneWeekAgo) {
                return;
              }
              return { ...c, endDate };
            })
          )
        ).filter(Boolean);

        return fetchedComps
          .map((c) => {
            return {
              id: c.id,
              name: c.name,
              country_iso2: c.schedule.venues?.[0].countryIso2 || '',
              start_date: c.schedule.startDate,
              end_date: c.endDate.toISOString().split('T')[0],
              city: '',
            };
          })
          .sort((a, b) => a.start_date.localeCompare(b.start_date));
      }

      const params = new URLSearchParams({
        start: oneWeekAgo.toISOString().split('T')[0],
        end: oneWeekFuture.toISOString().split('T')[0],
        sort: 'start_date',
        page: pageParam.toString(),
      });

      return wcaApiFetch<ApiCompetition[]>(
        `/competitions?${params.toString()}`
      );
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
    cacheTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <>
      {!online && (
        <NoteBox
          text="This app is operating in offline mode. Some competitions may not be available."
          prefix=""
        />
      )}
      {status === 'error' && <div>Error: {error?.toString()}</div>}

      <CompetitionListFragment
        title="Upcoming Competitions"
        competitions={upcomingCompetitions?.pages.flatMap((p) => p) || []}
        loading={isFetching}
      />

      {!isFetching && (
        <div className="flex justify-center p-1">
          <button
            ref={ref}
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}>
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
              ? 'Load Newer'
              : 'No more competitions to load'}
          </button>
        </div>
      )}

      {isFetchingNextPage && <BarLoader width="100%" />}
    </>
  );
}
