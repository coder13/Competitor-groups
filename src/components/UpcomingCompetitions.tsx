import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import useWCAFetch from '../hooks/useWCAFetch';
import { useInfiniteQuery } from '@tanstack/react-query';
import CompetitionListFragment from './CompetitionList';
import { BarLoader } from 'react-spinners';

// This is a magic number constant that comes from the WCA API.
const DEFAULT_WCA_PAGINATION = 25;

const oneWeekAgo = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000);
const oneWeekFuture = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);
export default function UpcomingCompetitions() {
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
  } = useInfiniteQuery<ApiCompetition[]>({
    queryKey: ['upcomingCompetitions'],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        start: oneWeekAgo.toISOString(),
        end: oneWeekFuture.toISOString(),
        sort: 'start_date',
        page: pageParam.toString(),
      });

      const [comps] = await wcaApiFetch(`/competitions?${params.toString()}`);

      return comps;
    },
    getNextPageParam: (lastPage, pages) => {
      // If we have more pages, keep going
      if (lastPage.length === DEFAULT_WCA_PAGINATION) {
        return pages.length + 1;
      }

      // Otherwise, we're done
      return undefined;
    },
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <>
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
