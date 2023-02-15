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
