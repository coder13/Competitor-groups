import { Link, useParams } from 'react-router-dom';
import { CompetitionSumOfRanksContainer } from '@/containers/CompetitionSumOfRanks';

export default function CompetitionSumOfRanks() {
  const { competitionId } = useParams<{ competitionId: string }>();

  if (!competitionId) {
    return null;
  }

  return <CompetitionSumOfRanksContainer competitionId={competitionId} LinkComponent={Link} />;
}
