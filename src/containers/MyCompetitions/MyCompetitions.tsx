import { useIsRestoring } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CompetitionListFragment } from '@/components';
import { useAuth } from '@/providers/AuthProvider';
import { useCompetitionsQuery } from '@/queries';
import { useMyCompetitionsQuery } from './MyCompetitions.query';

export function MyCompetitions() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isRestoring = useIsRestoring();
  const { error, status, isFetching, competitions, pinnedCompetitions } = useMyCompetitionsQuery(
    user?.id,
  );

  const { data: NotifyCompetitions } = useCompetitionsQuery();

  return (
    <>
      {status === 'error' && <div>Error: {error?.toString()}</div>}

      <CompetitionListFragment
        title={t('home.myCompetitions')}
        competitions={[...pinnedCompetitions, ...competitions]}
        loading={Boolean(user) && (isRestoring || isFetching)}
        liveCompetitionIds={NotifyCompetitions?.competitions?.map((c) => c.id) || []}
        showWhenEmpty={Boolean(user)}
      />
    </>
  );
}
