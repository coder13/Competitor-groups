import { Activity, Person } from '@wca/helpers';
import { activityDurationString } from '../../../lib/activities';

interface OtherGroupProps {
  activity: Activity;
  persons: Person[];
}

export default function OtherGroup({ activity, persons }: OtherGroupProps) {
  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">{activity.name || activity.activityCode}</h3>
        <p>
          Time: {new Date(activity.startTime).toLocaleDateString()}{' '}
          {activityDurationString(activity)}
        </p>
      </div>
      <div>{persons.map((person) => person.name).join(', ')}</div>
    </>
  );
}
