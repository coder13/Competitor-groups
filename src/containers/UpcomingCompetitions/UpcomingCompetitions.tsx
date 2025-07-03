import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { BarLoader } from 'react-spinners';
import { NoteBox, LastFetchedAt, CompetitionListFragment, Container } from '@/components';
import { useInfiniteCompetitions } from '@/hooks/queries/useInfiniteCompetitions';
import { useApp } from '@/providers/AppProvider';
import { useCompetitionsQuery } from '@/queries';

export default function UpcomingCompetitions() {
  const { t } = useTranslation();

  const { online } = useApp();
  const { ref, inView } = useInView();

  const {
    data: upcomingCompetitions,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
    status,
    dataUpdatedAt,
  } = useInfiniteCompetitions();

  const { data } = useCompetitionsQuery();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="pb-2">
      {!online && (
        <NoteBox
          text="This app is operating in offline mode. Some competitions may not be available."
          prefix=""
        />
      )}
      {status === 'error' && <div>Error: {error?.toString()}</div>}

      <CompetitionListFragment
        title={t('home.upcomingCompetitions')}
        competitions={upcomingCompetitions?.pages.flatMap((p) => p) || []}
        loading={status === 'pending'}
        liveCompetitionIds={data?.competitions?.map((c) => c.id) || []}
      />

      {online && status === 'success' && (
        <div className="flex justify-center p-1">
          <button
            ref={ref}
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load Newer' : ''}
          </button>
        </div>
      )}

      {isFetchingNextPage && <BarLoader width="100%" />}

      <Container className="p-2">
        <div className="flex space-x-2">
          <div className="text-xs text-gray-500">{__GIT_COMMIT__}</div>
          <div className="flex flex-grow" />
          {<LastFetchedAt lastFetchedAt={new Date(dataUpdatedAt)} />}
        </div>
      </Container>
    </div>
  );
}
