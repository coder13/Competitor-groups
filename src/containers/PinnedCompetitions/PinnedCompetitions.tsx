import { CompetitionListFragment } from '@/components';
import { usePinnedCompetitions } from '@/hooks/UsePinnedCompetitions';
import { useCompetitionsQuery } from '@/queries';

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
