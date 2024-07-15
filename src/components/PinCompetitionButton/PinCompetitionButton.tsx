import { useCompetition } from '../../hooks/queries/useCompetition';
import { usePinnedCompetitions } from '../../hooks/usePinnedCompetitions';
import { Button } from '../Button';

export const PinCompetitionButton = ({ competitionId }: { competitionId: string }) => {
  const { data, error } = useCompetition(competitionId);
  const { pinnedCompetitions, pinCompetition, unpinCompetition } = usePinnedCompetitions();

  const isPinned = pinnedCompetitions.some((c) => c.id === competitionId);

  return (
    <div>
      <Button
        onClick={() => {
          if (isPinned) {
            unpinCompetition(competitionId);
          } else if (data) {
            pinCompetition(data);
          }
        }}
        disabled={!data && !error}>
        {isPinned ? (
          <span className="fa fa-bookmark" />
        ) : (
          <span className="fa-regular fa-bookmark" />
        )}
      </Button>
    </div>
  );
};
