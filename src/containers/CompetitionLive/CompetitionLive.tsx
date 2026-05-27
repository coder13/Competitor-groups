import { Container, NotifyCompConnectionStatus } from '@/components';
import { LiveActivities } from '@/containers/LiveActivities';

export interface CompetitionLiveContainerProps {
  competitionId: string;
}

export function CompetitionLiveContainer({ competitionId }: CompetitionLiveContainerProps) {
  return (
    <Container>
      <div className="p-2">
        <i className="fa fa-tower-broadcast mr-1 text-green-500 type-heading" />
        <span className="type-heading">Live Activities </span>
      </div>
      <NotifyCompConnectionStatus className="mx-2" />
      <LiveActivities competitionId={competitionId} />
    </Container>
  );
}
