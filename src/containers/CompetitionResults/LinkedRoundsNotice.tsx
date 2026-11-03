import { Round } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { LinkRenderer } from '@/lib/linkRenderer';
import { activityCodeToRoundName } from '@/lib/roundLabels';
import { getLinkedRoundIds } from '@/lib/wcif';

export function LinkedRoundsNotice({
  competitionId,
  round,
  eventRounds,
  LinkComponent,
}: {
  competitionId: string;
  round: Round;
  eventRounds: Round[];
  LinkComponent: LinkRenderer;
}) {
  const { t } = useTranslation();
  const linkedIds = getLinkedRoundIds(eventRounds, round);
  if (linkedIds.length < 2) return null;

  return (
    <div className="space-y-2 rounded-md border border-tertiary-weak bg-panel p-2 text-muted">
      <p>{t('competition.results.dualRoundNote')}</p>
      <div className="flex flex-wrap gap-2">
        {linkedIds
          .filter((id) => id !== round.id)
          .map((id) => (
            <LinkComponent
              key={id}
              className="underline"
              to={`/competitions/${competitionId}/results/${id}`}>
              {activityCodeToRoundName(t, id)}
            </LinkComponent>
          ))}
      </div>
    </div>
  );
}
