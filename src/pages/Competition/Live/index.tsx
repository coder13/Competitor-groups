import { useParams } from 'react-router-dom';
import { CompetitionLiveContainer } from '@/containers/CompetitionLive';

export default function LivePage() {
  const { competitionId } = useParams();

  if (!competitionId) {
    return null;
  }

  return <CompetitionLiveContainer competitionId={competitionId} />;
}
