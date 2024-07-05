import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DisclaimerText from '../../../components/DisclaimerText';
import { useWCIF } from '../../../providers/WCIFProvider';
import { Container } from '../../../components/Container';
import { ScheduleContainer } from '../../../containers/Schedule';

export function Schedule() {
  const competitionId = useParams().competitionId;
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  return (
    <Container>
      <div className="flex w-full flex-col text-sm md:text-base py-2 p-2 sm:p-0">
        <DisclaimerText />
        <hr className="my-2" />
        <div className="flex flex-row justify-between">
          <Link
            to={`/competitions/${wcif?.id || competitionId}/rooms`}
            className="w-full border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row">
            View by Room
          </Link>
        </div>
        <hr className="my-2" />
        {wcif && <ScheduleContainer wcif={wcif} />}
      </div>
    </Container>
  );
}
