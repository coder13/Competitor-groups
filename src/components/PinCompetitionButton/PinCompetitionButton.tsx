import { usePinnedCompetitions } from '@/hooks/UsePinnedCompetitions';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { Button } from '../Button';

export const PinCompetitionButton = ({ competitionId }: { competitionId: string }) => {
  const { data, error } = useCompetition(competitionId);
  const { pinnedCompetitions, pinCompetition, unpinCompetition } = usePinnedCompetitions();

  const isPinned = pinnedCompetitions.some((c) => c.id === competitionId);

  return (
    <div>
      <Button
        variant="light"
        onClick={() => {
          if (isPinned) {
            unpinCompetition(competitionId);
          } else if (data) {
            pinCompetition(data);
          }
        }}
        disabled={!data && !error}>
        {isPinned ? (
          <span className="fa fa-bookmark text-yellow-500" />
        ) : (
          <span className="fa-regular fa-bookmark" />
        )}
      </Button>
    </div>
  );
};
