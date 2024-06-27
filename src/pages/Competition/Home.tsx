import { useWCIF } from '../../providers/WCIFProvider';
import { Competitors } from '../../containers/Competitors';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/Container';
import { OngoingActivities } from '../../containers/OngoingActivities';

export default function CompetitionHome() {
  const { competitionId } = useParams();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container className="divide-y-2 pt-2">
      <Link
        className="border bg-green-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-green-400 group transition-colors my-1 flex-row mx-2"
        to={`information`}>
        View Competition Information
      </Link>
      <OngoingActivities competitionId={competitionId!} />
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
