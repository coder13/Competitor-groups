import { useNavigate, useParams } from 'react-router-dom';
import { CompetitionEventsContainer } from '@/containers/CompetitionEvents';

const Events = () => {
  const navigate = useNavigate();
  const { competitionId } = useParams<{ competitionId: string }>();

  if (!competitionId) {
    return null;
  }

  return <CompetitionEventsContainer competitionId={competitionId} onNavigate={navigate} />;
};

export default Events;
