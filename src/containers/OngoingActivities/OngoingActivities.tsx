import { Link } from 'react-router-dom';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';
import ActivityRow from '../../components/ActivitiyRow';
import { useWCIF } from '../../providers/WCIFProvider';
import { useAuth } from '../../providers/AuthProvider';

interface OngoingActivitiesProps {
  competitionId: string;
}

export const OngoingActivities = ({ competitionId }: OngoingActivitiesProps) => {
  const { ongoingActivities } = useOngoingActivities(competitionId!);
  const { wcif } = useWCIF();
  const { user } = useAuth();

  const roles = wcif?.persons?.find((p) => p.wcaUserId === user?.id)?.roles;
  const isInChargeOfComp = roles?.some((r) =>
    ['delegate', 'trainee-delegate', 'organizer'].includes(r)
  );

  if (!ongoingActivities?.length) {
    const subject = `[${wcif?.shortName}]%20NotifyComp%20Support%20Request`;
    const body = `Hello, I am a ${
      roles?.some((i) => i.includes('delegate')) ? 'delegate' : 'organizer'
    } for ${wcif?.shortName} and I would like to learn more about live activity support.`;

    return isInChargeOfComp && wcif?.id ? (
      <div className="py-2">
        <a
          className="border border-green-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-green-200 group transition-colors my-1 flex-row mx-2"
          href={`mailto:support@notifycomp.com?subject=${subject}&body=${body}`}
          target="_blank"
          rel="noreferrer">
          Elevate your competition, learn about live activity support
        </a>
      </div>
    ) : null;
  }

  return (
    <div className="my-1 p-2">
      <h1 className="drop-shadow-sm flex justify-between">
        <div>
          <i className="text-lg fa fa-tower-broadcast mr-1 text-green-500" />
          <span className="text-xl">Live Activities </span>
          <span className="text-xs align-super">Powered by NotifyComp</span>
        </div>
        <div>
          <Link to={`/competitions/${competitionId}/live`}>Go to live view</Link>
        </div>
      </h1>
      <div className="flex flex-col">
        {ongoingActivities.map((a) => {
          const venue = wcif?.schedule?.venues?.find((v) =>
            v.rooms.some((r) => r.id === a.parent?.parent?.room?.id || r.id === a.parent?.room?.id)
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
  );
};
