import { useParams } from 'react-router-dom';
import { CompetitionPersonContainer } from '@/containers/CompetitionPerson';

export default function PersonPage() {
  const { registrantId } = useParams();

  if (!registrantId) {
    return null;
  }

  return <CompetitionPersonContainer registrantId={registrantId} />;
}
