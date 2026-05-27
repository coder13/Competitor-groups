import { Link, useParams } from 'react-router-dom';
import { CompetitionResultsContainer } from '@/containers/CompetitionResults';

export default function CompetitionResults() {
  const { competitionId, roundId } = useParams<{
    competitionId: string;
    roundId?: string;
  }>();

  if (!competitionId) {
    return null;
  }

  return (
    <CompetitionResultsContainer
      competitionId={competitionId}
      selectedRoundId={roundId}
      LinkComponent={Link}
    />
  );
}
