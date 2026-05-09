import { Link, useNavigate, useParams } from 'react-router-dom';
import { CompetitionGroupContainer } from '@/containers/CompetitionGroup';

export default function Group() {
  const { competitionId, roundId, groupNumber } = useParams();
  const navigate = useNavigate();

  if (!competitionId || !roundId || !groupNumber) {
    return null;
  }

  return (
    <CompetitionGroupContainer
      competitionId={competitionId}
      LinkComponent={Link}
      roundId={roundId}
      groupNumber={groupNumber}
      onNavigate={navigate}
    />
  );
}
