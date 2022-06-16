import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWCIF } from '../WCIFProvider';
import { allActivities, parseActivityCode } from '../../../lib/activities';
import { byDate, groupBy } from '../../../lib/utils';

const DaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
        .sort(byDate),
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
    (x) => x.date
  );

  const renderAssignments = () => (
    <>
      <h4 className="text-xl mb-2 text-center">Assignments</h4>
      <div className="shadow-md">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 shadow-sm">
              <th className="py-2 text-center">Time</th>
              <th className="py-2 text-center">Event</th>
              <th className="py-2 text-center">Round</th>
              <th className="py-2 text-center">Group</th>
              <th className="py-2 text-center">Stage</th>
              <th className="py-2 text-center">Assignment</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(assignmentsSplitAcrossDates).map((dayOfWeek) => (
              <>
                <tr>
                  <td colSpan={6} className="font-bold text-lg text-center py-2">
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
                    <Link
                      key={`${assignment.activityId}-${assignment.assignmentCode}`}
                      className="table-row text-xs even:bg-slate-50 hover:bg-slate-100"
                      to={`/competitions/${wcif.id}/activities/${assignment.activityId}`}>
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
                    </Link>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="flex flex-col p-1">
      <div className="p-1">
        <h3 className="text-2xl">{person.name}</h3>
        {person.wcaId && <p className="text-sm">{person.wcaId}</p>}
        <p className="text-md">
          <span>Registered Events:</span>
          {person.registration.eventIds.map((eventId) => (
            <span key={eventId} className={`cubing-icon event-${eventId} mx-1`} />
          ))}
        </p>
      </div>
      <hr className="my-2" />

      {person.assignments.length > 0 ? renderAssignments() : <div>No Assignments</div>}
    </div>
  );
}
