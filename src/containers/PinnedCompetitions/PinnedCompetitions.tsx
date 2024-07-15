import { useCompetitionsQuery } from '../../queries';
import { usePinnedCompetitions } from '../../hooks/usePinnedCompetitions';
import CompetitionListFragment from '../../components/CompetitionList';

export function PinnedCompetitions() {
  const { pinnedCompetitions } = usePinnedCompetitions();

  const { data: NotifyCompetitions } = useCompetitionsQuery();

  if (pinnedCompetitions.length === 0) {
    return null;
  }

  return (
    <CompetitionListFragment
      title="Bookmarked Competitions"
      competitions={pinnedCompetitions}
      loading={false}
      liveCompetitionIds={NotifyCompetitions?.competitions?.map((c) => c.id) || []}
    />
  );
}
