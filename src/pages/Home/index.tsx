import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyCompetitions } from '../../containers/MyCompetitions';
import UpcomingCompetitions from '../../containers/UpcomingCompetitions/UpcomingCompetitions';
import { Container } from '../../components/Container';
import { CompetitionSelect } from '../../components/CompetitionSelect';

export default function Home() {
  useEffect(() => {
    document.title = 'Competition Groups';
  }, []);

  return (
    <div className="flex flex-col items-center w-full overflow-auto">
      <Container>
        <div className="flex flex-col w-full text-xs md:text-sm py-2 px-2 md:px-0">
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
        <div className="px-2">
          <Link
            className="flex w-full py-2.5 px-2 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 "
            to="/support">
            Keep the lights on!
          </Link>
        </div>
        <MyCompetitions />
        <div className="px-2">
          <CompetitionSelect onSelect={(e) => console.log(e)} />
        </div>
        <UpcomingCompetitions />
      </Container>
    </div>
  );
}
