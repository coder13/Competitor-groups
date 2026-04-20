import { Link } from 'react-router-dom';
import { CompetitionCompareSchedulesContainer } from '@/containers/CompetitionCompareSchedules';
import { useWCIF } from '@/providers/WCIFProvider';

export default function CompareSchedules() {
  const { wcif, competitionId } = useWCIF();

  if (!wcif) {
    return null;
  }

  return (
    <CompetitionCompareSchedulesContainer competitionId={competitionId} LinkComponent={Link} />
  );
}
