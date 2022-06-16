import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { allActivities } from '../../../lib/activities';
import { useWCIF } from '../WCIFProvider';
import EventGroup from './EventGroup';
import OtherGroup from './OtherGroup';

export default function Group() {
  const { wcif } = useWCIF();
  const { activityId } = useParams();

  const activity = useMemo(
    () => allActivities(wcif).find((a) => a.id === +activityId),
    [wcif, activityId]
  );

  const everyoneInActivity = useMemo(
    () =>
      wcif.persons
        .map((person) => ({
          ...person,
          assignments: person.assignments.filter((a) => a.activityId === +activityId),
        }))
        .filter(({ assignments }) => assignments.length > 0) || [],
    [wcif.persons, activityId]
  );

  const isEventGroup = activity.activityCode.split('-')[0] !== 'other';
  const GroupComponent = isEventGroup ? EventGroup : OtherGroup;

  console.log(31, activity);

  return (
    <div>
      {wcif.id && activity && everyoneInActivity && (
        <GroupComponent competitionId={wcif.id} activity={activity} persons={everyoneInActivity} />
      )}
    </div>
  );
}
