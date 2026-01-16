import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { Competitors } from '@/containers/Competitors';
import { OngoingActivities } from '@/containers/OngoingActivities';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionHomeHeader } from './CompetitionHomeHeader';

export default function CompetitionHome() {
  const { t } = useTranslation();
  const { competitionId } = useParams() as { competitionId: string };
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container className="space-y-2 pt-2 p-1">
      <CompetitionHomeHeader
        competitionId={competitionId}
        startDate={wcif?.schedule?.startDate}
        numberOfDays={wcif?.schedule?.numberOfDays}
        venueName={wcif?.schedule?.venues?.[0]?.name}
      />
      <div className="flex space-x-2">
        <LinkButton
          to="information"
          title={t('competition.competitors.viewCompetitionInformation')}
          variant="subtle"
        />
      </div>
      <OngoingActivities competitionId={competitionId!} />
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
