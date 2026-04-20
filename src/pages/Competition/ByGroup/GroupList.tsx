import { Link, useParams } from 'react-router-dom';
import { CompetitionRoundContainer } from '@/containers/CompetitionRound';

export default function GroupList() {
  const { competitionId, roundId } = useParams();

  if (!competitionId || !roundId) {
    return null;
  }

  return (
    <CompetitionRoundContainer
      competitionId={competitionId}
      roundId={roundId}
      LinkComponent={Link}
    />
  );
}
