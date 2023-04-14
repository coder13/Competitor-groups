import { Activity, Person } from '@wca/helpers';
import { useEffect } from 'react';
import { activityDurationString, rooms } from '../../../lib/activities';
import { useWCIF } from '../WCIFProvider';

interface OtherGroupProps {
  activity: Activity;
  persons: Person[];
}

export default function OtherGroup({ activity, persons }: OtherGroupProps) {
  const { setTitle, wcif } = useWCIF();

  useEffect(() => {
    if (activity) {
      setTitle(activity.activityCode);
    }
  }, [activity, setTitle]);

  const room = rooms(wcif).find((r) =>
    r.activities.some(
      (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id)
    )
  );

  const venue = wcif.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">{activity.name || activity.activityCode}</h3>
        <p>
          Time: {new Date(activity.startTime).toLocaleDateString()}{' '}
          {activityDurationString(activity, timeZone)}
        </p>
      </div>
      <div>{persons.map((person) => person.name).join(', ')}</div>
    </>
  );
}
