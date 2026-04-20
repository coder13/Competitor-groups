import { Link, useParams } from 'react-router-dom';
import { CompetitionScheduleContainer } from '@/containers/CompetitionSchedule';

export function Schedule() {
  const { competitionId } = useParams();

  if (!competitionId) {
    return null;
  }

  return <CompetitionScheduleContainer competitionId={competitionId} LinkComponent={Link} />;
}
