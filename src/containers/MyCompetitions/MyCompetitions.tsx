import { useAuth } from '../../providers/AuthProvider';
import CompetitionListFragment from '../../components/CompetitionList/CompetitionList';
import { useCompetitionsQuery } from '../../queries';
import { useMyCompetitionsQuery } from './MyCompetitions.query';

export function MyCompetitions() {
  const { user } = useAuth();
  const { error, status, isLoading, competitions, pinnedCompetitions } = useMyCompetitionsQuery(
    user?.id
  );

  const { data: NotifyCompetitions } = useCompetitionsQuery();

  return (
    <>
      {status === 'error' && <div>Error: {error?.toString()}</div>}

      <CompetitionListFragment
        title="Your Competitions"
        competitions={[...pinnedCompetitions, ...competitions]}
        loading={isLoading && !pinnedCompetitions.length}
        liveCompetitionIds={NotifyCompetitions?.competitions?.map((c) => c.id) || []}
      />
    </>
  );
}
