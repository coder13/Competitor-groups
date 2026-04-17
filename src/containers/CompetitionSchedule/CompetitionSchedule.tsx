import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, DisclaimerText, LinkButton } from '@/components';
import { ScheduleContainer } from '@/containers/Schedule';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionScheduleContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionScheduleContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionScheduleContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.schedule.title'));
  }, [setTitle, t]);

  const resolvedCompetitionId = wcif?.id || competitionId;

  return (
    <Container>
      <div className="flex w-full flex-col space-y-1 p-1 py-2 type-body sm:p-0">
        <DisclaimerText className="my-2" />
        <hr />
        <div className="flex flex-row justify-between">
          <LinkButton
            LinkComponent={LinkComponent}
            to={`/competitions/${resolvedCompetitionId}/rooms`}
            title={t('competition.schedule.selectRoom')}
            variant="blue"
          />
        </div>
        <hr />
        {wcif && <ScheduleContainer wcif={wcif} LinkComponent={LinkComponent} />}
      </div>
    </Container>
  );
}
