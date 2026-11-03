import { useTranslation } from 'react-i18next';
import { usePinnedCompetitions } from '@/hooks/UsePinnedCompetitions';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { Button } from '../Button';

export const PinCompetitionButton = ({ competitionId }: { competitionId: string }) => {
  const { t } = useTranslation();
  const { data, error } = useCompetition(competitionId);
  const { pinnedCompetitions, pinCompetition, unpinCompetition } = usePinnedCompetitions();

  const isPinned = pinnedCompetitions.some((c) => c.id === competitionId);

  return (
    <div>
      <Button
        variant="light"
        aria-label={t('common.bookmarkCompetition')}
        aria-pressed={isPinned}
        onClick={() => {
          if (isPinned) {
            unpinCompetition(competitionId);
          } else if (data) {
            pinCompetition(data);
          }
        }}
        disabled={!data && !error}>
        {isPinned ? (
          <span className="fa fa-bookmark text-yellow-500" aria-hidden="true" />
        ) : (
          <span className="fa-regular fa-bookmark" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
};
