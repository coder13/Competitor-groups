import { useParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { LiveActivities } from '@/containers/LiveActivities';

export default function LivePage() {
  const { competitionId } = useParams();
  return (
    <Container>
      <div className="p-2">
        <i className="text-lg fa fa-tower-broadcast mr-1 text-green-500" />
        <span className="text-xl">Live Activities </span>
      </div>
      <LiveActivities competitionId={competitionId!} />
    </Container>
  );
}
