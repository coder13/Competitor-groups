import { useEffect } from 'react';
import MyCompetitions from '../../components/MyCompetitions';
import UpcomingCompetitions from '../../containers/UpcomingCompetitions/UpcomingCompetitions';
import { useAuth } from '../../providers/AuthProvider';
import { Link } from 'react-router-dom';
import { Container } from '../../components/Container';

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Competition Groups';
  }, []);

  return (
    <Container>
      <div className="flex flex-col w-full text-xs md:text-base p-2 md:p-0">
        <p>Learn all you need about your WCA competition assignments!</p>
        <p>
          Note: This website exists as a convenience tool for organizers, delegates, and
          competitors. The information provided is based on scheduled data. Pay close attention to
          the competition for the most up-to-date information. Start and end times can fluctuate.
        </p>
        <Link to="/about" className="text-blue-700 underline">
          How does this site work?
        </Link>
      </div>
      {user && (
        <>
          <MyCompetitions />
          <br />
        </>
      )}
      <UpcomingCompetitions />
    </Container>
  );
}
