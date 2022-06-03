import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWCIF } from '../WCIFProvider';
import { allActivities, parseActivityCode } from '../../../lib/activities';

const DaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const groupBy = (xs, key) =>
  xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});

const AssignmentCodesToText = {
  competitor: 'Competitor',
  'staff-scrambler': 'Scrambler',
  'staff-judge': 'Judge',
};

export default function Person() {
  const { wcif } = useWCIF();
  const { registrantId } = useParams();

  const person = wcif.persons.find((p) => p.registrantId.toString() === registrantId);

  const _allActivities = useMemo(() => allActivities(wcif), [wcif]);

  const getActivity = useCallback(
    (assignment) => _allActivities.find(({ id }) => id === assignment.activityId),
    [_allActivities]
  );

  const assignments = useMemo(
    () =>
      person.assignments
        .map((assignment) => ({
          ...assignment,
          activity: _allActivities.find(({ id }) => id === assignment.activityId),
        }))
        .sort((a, b) => new Date(a.activity.startTime) - new Date(b.activity.startTime)),
    [_allActivities, person.assignments]
  );

  if (!person) {
    return 'Loading...';
  }

  console.log(69, assignments);

  const assignmentsSplitAcrossDates = groupBy(
    assignments.map((a) => ({
      ...a,
      date: DaysOfWeek[new Date(a.activity.startTime).getDay()],
    })),
    'date'
  );

  const renderAssignments = () => (
    <>
      <h4 className="text-xl mb-2">Assignments</h4>
      <table className="text-xs sm:text-sm">
        <thead>
          <tr>
            <td className="text-center">Time</td>
            <td className="text-center">Event</td>
            <td className="text-center">Round</td>
            <td className="text-center">Group</td>
            <td className="text-center">Stage</td>
            <td className="text-center">Assignment</td>
          </tr>
        </thead>
        <tbody>
          {Object.keys(assignmentsSplitAcrossDates).map((dayOfWeek) => (
            <>
              <tr>
                <td colspan={6} className="font-bold text-lg text-center p-2">
                  {dayOfWeek}
                </td>
              </tr>
              {assignmentsSplitAcrossDates[dayOfWeek].map((assignment) => {
                const activity = getActivity(assignment);
                const { eventId, roundNumber, groupNumber } = parseActivityCode(
                  activity.activityCode
                );
                const roomName = activity?.room?.name || activity?.parent?.room?.name;

                return (
                  <tr
                    key={`${assignment.activityId}-${assignment.assignmentCode}`}
                    className="text-xs">
                    <td className="py-2 text-center">
                      {new Date(activity.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`cubing-icon event-${eventId} mx-1`} />
                    </td>
                    <td className="py-2 text-center">{roundNumber}</td>
                    <td className="py-2 text-center">{groupNumber || '*'}</td>
                    <td className="py-2 text-center">{roomName}</td>
                    <td className="py-2 text-center">
                      {AssignmentCodesToText[assignment.assignmentCode] ||
                        assignment.assignmentCode}
                    </td>
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="flex flex-col p-4">
      <h3 className="text-2xl">{person.name}</h3>
      {person.wcaId && <p className="text-sm">{person.wcaId}</p>}
      <p className="text-md">
        <span>Registered Events:</span>
        {person.registration.eventIds.map((eventId) => (
          <span key={eventId} className={`cubing-icon event-${eventId} mx-1`} />
        ))}
      </p>
      <hr className="my-2" />

      {person.assignments.length > 0 ? renderAssignments() : <div>No Assignments</div>}
    </div>
  );
}
