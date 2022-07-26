import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allActivities } from '../../lib/activities';
import { useWCIF } from './WCIFProvider';

export default function Round() {
  const { wcif } = useWCIF();

  const activities = useMemo(
    () =>
      allActivities(wcif)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .filter((activity) => activity.childActivities.length === 0),
    [wcif]
  );

  return (
    <div className="flex w-full flex-col text-sm sm:text-base">
      {activities.map((activity) => (
        <Link
          key={activity.id}
          className="flex flex-col w-full p-2 even:bg-slate-50 hover:bg-slate-100 even:hover:bg-slate-200"
          to={`/competitions/${wcif.id}/activities/${activity.id}`}>
          <span>{activity.name}</span>
          <span className="text-xs sm:text-sm">
            {(activity?.parent?.parent?.room || activity?.parent?.room || activity?.room)?.name}:{' '}
            {new Date(activity.startTime).toLocaleString()}
          </span>
        </Link>
      ))}
    </div>
  );
}
