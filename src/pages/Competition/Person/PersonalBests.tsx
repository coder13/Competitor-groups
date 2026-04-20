import { useParams } from 'react-router-dom';
import { CompetitionPersonalBestsContainer } from '@/containers/CompetitionPersonalBests';

export default function PersonalBests() {
  const { wcaId } = useParams<{ wcaId: string }>();

  if (!wcaId) {
    return null;
  }

  return <CompetitionPersonalBestsContainer wcaId={wcaId} />;
}
