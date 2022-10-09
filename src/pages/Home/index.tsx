import { useEffect } from 'react';
import CompetitionList from '../../components/CompetitionList';

export default function Home() {
  useEffect(() => {
    document.title = 'Competition Groups';
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="md:w-1/2 w-full">
        <CompetitionList />
      </div>
    </div>
  );
}
