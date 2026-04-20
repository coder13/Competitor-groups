import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { PinCompetitionButton } from '@/components/PinCompetitionButton';
import { Competitors } from '@/containers/Competitors';
import { OngoingActivities } from '@/containers/OngoingActivities';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionHomeContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionHomeContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionHomeContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container className="space-y-2 p-1 pt-2">
      <div className="flex space-x-2">
        <LinkButton
          LinkComponent={LinkComponent}
          to="information"
          title={t('competition.competitors.viewCompetitionInformation')}
          variant="green"
        />
        <PinCompetitionButton competitionId={competitionId} />
      </div>
      <OngoingActivities competitionId={competitionId} />
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
