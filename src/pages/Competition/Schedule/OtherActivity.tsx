import { Activity, AssignmentCode, Person } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '@/lib/activities';
import { formatDateTimeRange } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';
import { PeopleList } from './PeopleList';

interface OtherGroupProps {
  competitionId: string;
  activity: Activity;
  persons: Person[];
}

const isAssignment = (assignment) => (a) =>
  a.assignments.some(({ assignmentCode }) => assignmentCode === assignment);

export function OtherActivity({ competitionId, activity, persons }: OtherGroupProps) {
  const { setTitle, wcif } = useWCIF();

  useEffect(() => {
    if (activity) {
      setTitle(activity.activityCode);
    }
  }, [activity, setTitle]);

  const room = useMemo(
    () =>
      wcif &&
      getRooms(wcif).find((r) =>
        r.activities.some(
          (a) => a.id === activity.id || a?.childActivities?.some((ca) => ca.id === activity.id),
        ),
      ),
    [activity.id, wcif],
  );

  const venue = wcif?.schedule.venues?.find((v) => v.rooms.some((r) => r.id === room?.id));
  const timeZone = venue?.timezone;

  const assignments = useMemo(
    () => new Set(persons.map((person) => person.assignments?.map((a) => a.assignmentCode)).flat()),
    [persons],
  );

  const peopleByAssignmentCode = (Array.from(assignments.values()) as AssignmentCode[])
    .filter((assignmentCode) => assignmentCode !== 'competitor')
    .reduce((acc, assignmentCode) => {
      acc[assignmentCode] = persons.filter(isAssignment(assignmentCode));
      return acc;
    }, {}) as Record<AssignmentCode, Person[]>;

  return (
    <>
      <div className="p-2">
        <h3 className="font-bold">
          <Link
            className="px-3 py-2 rounded mr-2"
            style={{
              backgroundColor: `${room?.color}70`,
            }}
            to={`/competitions/${wcif?.id}/rooms/${room?.id}`}>
            {room?.name}
          </Link>
          {activity.name || activity.activityCode}
        </h3>{' '}
        <p className="p-2">
          {formatDateTimeRange(activity.startTime, activity.endTime, 5, timeZone)}
        </p>
      </div>
      <PeopleList
        competitionId={competitionId}
        activity={activity}
        peopleByAssignmentCode={peopleByAssignmentCode}
      />
    </>
  );
}
