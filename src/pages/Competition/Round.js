import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  activityCodeToName,
  groupActivitiesByRound,
  parseActivityCode,
} from '../../lib/activities';
import { useWCIF } from './WCIFProvider';

export default function Round() {
  const { wcif } = useWCIF();
  const { eventId, roundNumber } = useParams();
  const activityCode = `${eventId}-r${roundNumber}`;

  const event = useMemo(() => wcif?.events?.find((e) => e.id === eventId), [wcif, eventId]);
  const round = useMemo(
    () => event?.rounds?.find((r) => r.id === activityCode),
    [event?.rounds, activityCode]
  );

  const groups = useMemo(() => groupActivitiesByRound(wcif, round.id));

  const personAssignments = useMemo(() => {
    return wcif.persons
      .map((person) => {
        const competingActivityId = person.assignments.find(
          (a) =>
            a.assignmentCode === 'competitor' &&
            groups.some((groupActivity) => groupActivity.id === a.activityId)
        )?.activityId;
        const staffingAssignments = person.assignments.filter(
          (a) =>
            a.assignmentCode.indexOf('staff') > -1 &&
            groups.some((groupActivity) => groupActivity.id === a.activityId)
        );

        return {
          ...person,
          assignments: {
            competingActivity: groups.find((g) => g.id === competingActivityId),
            staffingActivities: staffingAssignments.map((s) => ({
              assignment: s,
              activity: groups.find((g) => g.id === s.activityId),
            })),
          },
        };
      })
      .filter(
        (person) =>
          !!person?.assignments?.competingActivity ||
          !!person?.assignments?.staffingActivities?.length > 0
      );
  });

  return (
    <div className="p-2">
      <h3 className="text-2xl">Groups for {activityCodeToName(round.id)}</h3>
      <table className="text-left">
        <thead>
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Competing</th>
            <th className="px-6 py-3">Judging</th>
            <th className="px-6 py-3">Scrambling</th>
          </tr>
        </thead>
        <tbody>
          {personAssignments.map((person) => (
            <Link
              key={person.registrantId}
              className="table-row hover:bg-slate-100"
              to={`/competitions/${wcif.id}/persons/${person.registrantId}`}>
              <td className="px-6 py-3">{person.name}</td>
              <td
                className="px-6 py-3 text-white"
                style={{ backgroundColor: person.assignments.competingActivity.parent.room.color }}>
                {parseActivityCode(person.assignments.competingActivity.activityCode).groupNumber}
              </td>
              <td className="px-6 py-3 text-white">
                {person.assignments.staffingActivities
                  .filter((s) => s.assignment.assignmentCode === 'staff-judge')
                  .map((s) => (
                    <span className="p-3" style={{ backgroundColor: s.activity.parent.room.color }}>
                      {parseActivityCode(s.activity.activityCode).groupNumber}
                    </span>
                  ))}
              </td>
              <td className="text-white">
                {person.assignments.staffingActivities
                  .filter((s) => s.assignment.assignmentCode === 'staff-scrambler')
                  .map((s) => (
                    <span className="p-3" style={{ backgroundColor: s.activity.parent.room.color }}>
                      {parseActivityCode(s.activity.activityCode).groupNumber}
                    </span>
                  ))}
              </td>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  );
}
