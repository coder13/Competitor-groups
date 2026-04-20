import { Link, useParams } from 'react-router-dom';
import { CompetitionRoomContainer } from '@/containers/CompetitionRoom';

export function CompetitionRoom() {
  const { competitionId, roomId } = useParams<{ competitionId: string; roomId: string }>();

  if (!competitionId || !roomId) {
    return null;
  }

  return (
    <CompetitionRoomContainer competitionId={competitionId} roomId={roomId} LinkComponent={Link} />
  );
}
