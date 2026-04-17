import { Link } from 'react-router-dom';
import { CompetitionStreamScheduleContainer } from '@/containers/CompetitionStreamSchedule';
import { useWCIF } from '@/providers/WCIFProvider';

export default function CompetitionStreamSchedule() {
  const { competitionId } = useWCIF();

  return <CompetitionStreamScheduleContainer competitionId={competitionId} LinkComponent={Link} />;
}
