import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DisclaimerText from '../../components/DisclaimerText';
import { allActivities } from '../../lib/activities';
import { formatDateTimeRange } from '../../lib/utils';
import { useWCIF } from './WCIFProvider';

export default function Round() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const activities = useMemo(
    () =>
      allActivities(wcif)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .filter((activity) => activity.childActivities.length === 0),
    [wcif]
  );

  return (
    <div className="flex w-full flex-col text-sm sm:text-base py-2">
      <DisclaimerText />
      <hr className="my-2" />
      {activities.map((activity) => {
        const venue = wcif.schedule.venues?.find((v) =>
          v.rooms.some(
            (r) =>
              r.id === activity.parent?.parent?.room?.id ||
              r.id === activity.parent?.room?.id ||
              activity?.room?.id
          )
        );
        const timeZone = venue?.timezone;

        return (
          <Link
            key={activity.id}
            className="flex flex-col w-full p-2 even:bg-slate-50 hover:bg-slate-100 even:hover:bg-slate-200"
            to={`/competitions/${wcif.id}/activities/${activity.id}`}>
            <span>{activity.name}</span>
            <span className="text-xs sm:text-sm font-light">
              {(activity?.parent?.parent?.room || activity?.parent?.room || activity?.room)?.name}:{' '}
              {formatDateTimeRange(activity.startTime, activity.endTime, 5, timeZone)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
