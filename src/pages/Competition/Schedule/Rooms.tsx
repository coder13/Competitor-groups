import { Link, useParams } from 'react-router-dom';
import { CompetitionRoomsContainer } from '@/containers/CompetitionRooms';

export function CompetitionRooms() {
  const { competitionId } = useParams<{ competitionId: string }>();

  if (!competitionId) {
    return null;
  }

  return <CompetitionRoomsContainer competitionId={competitionId} LinkComponent={Link} />;
}
