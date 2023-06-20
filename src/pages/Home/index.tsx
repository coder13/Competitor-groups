import { useEffect } from 'react';
import MyCompetitions from '../../components/MyCompetitions';
import UpcomingCompetitions from '../../components/UpcomingCompetitions';
import { useAuth } from '../../providers/AuthProvider';

export default function Home() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Competition Groups';
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="md:w-1/2 w-full pt-2">
        <div className="flex flex-col w-full">
          <p>Learn all you need about your WCA competition assignments!</p>
          <p>
            Note: This website exists as a convenience tool for organizers, delegates, and
            competitors. The information provided is based on scheduled data. Pay close attention to
            the competition for the most up-to-date information. Start and end times can fluctuate.
          </p>
        </div>
        {user && (
          <>
            <MyCompetitions />
            <br />
          </>
        )}
        <UpcomingCompetitions />
      </div>
    </div>
  );
}
