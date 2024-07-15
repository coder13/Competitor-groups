import { useWCIF } from '../../../providers/WCIFProvider';
import { Competitors } from '../../../containers/Competitors';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../../components/Container';
import { OngoingActivities } from '../../../containers/OngoingActivities';
import { LinkButton } from '../../../components/LinkButton';
import { PinCompetitionButton } from '../../../components/PinCompetitionButton';

export default function CompetitionHome() {
  const { competitionId } = useParams() as { competitionId: string };
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container className="space-y-2 pt-2">
      <div className="flex space-x-2">
        <LinkButton to="information" title="View Competition Information" color="green" />
        <PinCompetitionButton competitionId={competitionId} />
      </div>
      <OngoingActivities competitionId={competitionId!} />
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
