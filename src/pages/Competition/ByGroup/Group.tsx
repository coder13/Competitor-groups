import { Link, useParams } from 'react-router-dom';
import { CompetitionGroupContainer } from '@/containers/CompetitionGroup';

export default function Group() {
  const { competitionId, roundId, groupNumber } = useParams();

  if (!competitionId || !roundId || !groupNumber) {
    return null;
  }

  return (
    <CompetitionGroupContainer
      competitionId={competitionId}
      LinkComponent={Link}
      roundId={roundId}
      groupNumber={groupNumber}
    />
  );
}
