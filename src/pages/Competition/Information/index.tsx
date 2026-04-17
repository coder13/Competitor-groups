import { useParams } from 'react-router-dom';
import { CompetitionInformationContainer } from '@/containers/CompetitionInformation';

export default function Information() {
  const { competitionId = '' } = useParams<{ competitionId: string }>();

  if (!competitionId) {
    return null;
  }

  return <CompetitionInformationContainer competitionId={competitionId} />;
}
