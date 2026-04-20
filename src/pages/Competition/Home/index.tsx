import { Link, useParams } from 'react-router-dom';
import { CompetitionHomeContainer } from '@/containers/CompetitionHome';

export default function CompetitionHome() {
  const { competitionId } = useParams() as { competitionId?: string };

  if (!competitionId) {
    return null;
  }

  return <CompetitionHomeContainer competitionId={competitionId} LinkComponent={Link} />;
}
