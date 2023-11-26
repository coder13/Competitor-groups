import { useWCIF } from './WCIFProvider';
import { Competitors } from '../../containers/Competitors';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../../components/Container';
import ActivityRow from '../../components/ActivitiyRow';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';

export default function CompetitionHome() {
  const { competitionId } = useParams();
  const { wcif, setTitle } = useWCIF();

  const ongoingActivities = useOngoingActivities(competitionId!);

  useEffect(() => {
    setTitle('');
  }, [setTitle]);

  return (
    <Container>
      <Link
        className="border bg-green-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-green-400 group transition-colors my-1 flex-row mx-2"
        to={`information`}>
        View Competition Information
      </Link>
      <br />
      <hr />
      {ongoingActivities.length > 0 && (
        <>
          <div className="p-2">
            <h1 className="text-xl drop-shadow-sm">
              <i className="text-lg fa fa-tower-broadcast mr-1 text-green-500" />
              Live Activities <span className="text-xs align-super">Powered by NotifyComp</span>
            </h1>
            <div className="flex flex-col">
              {ongoingActivities.map((a) => {
                const venue = wcif?.schedule?.venues?.find((v) =>
                  v.rooms.some(
                    (r) => r.id === a.parent?.parent?.room?.id || r.id === a.parent?.room?.id
                  )
                );
                const timeZone = venue?.timezone ?? wcif?.schedule.venues?.[0]?.timezone ?? '';

                return (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    timeZone={timeZone}
                    room={a?.parent?.parent?.room || a?.parent?.room || a?.room}
                    showRoom={false}
                  />
                );
              })}
            </div>
          </div>
          <hr />
        </>
      )}
      {wcif && <Competitors wcif={wcif} />}
    </Container>
  );
}
