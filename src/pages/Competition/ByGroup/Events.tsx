import { useParams } from 'react-router-dom';
import { CompetitionEventsContainer } from '@/containers/CompetitionEvents';

const Events = () => {
  const { competitionId } = useParams<{ competitionId: string }>();

  if (!competitionId) {
    return null;
  }

  return <CompetitionEventsContainer competitionId={competitionId} />;
};

export default Events;
