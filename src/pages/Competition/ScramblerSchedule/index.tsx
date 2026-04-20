import { Link } from 'react-router-dom';
import { CompetitionScramblerScheduleContainer } from '@/containers/CompetitionScramblerSchedule';
import { useWCIF } from '@/providers/WCIFProvider';

export default function ScramblerSchedule() {
  const { competitionId } = useWCIF();

  return (
    <CompetitionScramblerScheduleContainer competitionId={competitionId} LinkComponent={Link} />
  );
}
