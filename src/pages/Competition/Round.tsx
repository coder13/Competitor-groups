import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  activityCodeToName,
  groupActivitiesByRound,
  parseActivityCode,
} from '../../lib/activities';
import { byName } from '../../lib/utils';
import { useWCIF } from './WCIFProvider';

export default function Round() {
  const { wcif, setTitle } = useWCIF();
  const { eventId, roundNumber } = useParams();
  const activityCode = `${eventId}-r${roundNumber}`;

  const groups = useMemo(() => groupActivitiesByRound(wcif, activityCode), [activityCode, wcif]);

  useEffect(() => {
    setTitle(activityCodeToName(activityCode));
  }, [activityCode, setTitle]);

  const personAssignments = useMemo(() => {
    return wcif.persons
      .map((person) => {
        const competingActivityId = person?.assignments?.find(
          (a) =>
            a.assignmentCode === 'competitor' &&
            groups.some((groupActivity) => groupActivity?.id === parseInt(a.activityId, 10))
        )?.activityId;

        const staffingAssignments =
          person?.assignments?.filter(
            (a) =>
              a.assignmentCode.indexOf('staff') > -1 &&
              groups.some((groupActivity) => groupActivity.id === parseInt(a.activityId, 10))
          ) || [];

        return {
          ...person,
          assignments: {
            competingActivity: groups.find(
              (g) => competingActivityId && g.id === parseInt(competingActivityId, 10)
            ),
            staffingActivities: staffingAssignments.map((s) => ({
              assignment: s,
              activity: groups.find((g) => g.id === parseInt(s.activityId, 10)),
            })),
          },
        };
      })
      .filter(
        (person) =>
          !!person?.assignments?.competingActivity ||
          person?.assignments?.staffingActivities?.length > 0
      );
  }, [groups, wcif.persons]);

  return (
    <div className="p-2">
      <h3 className="text-2xl">Groups for {activityCodeToName(activityCode)}</h3>
      <table className="text-left">
        <thead>
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Compete</th>
            <th className="px-6 py-3">Judge</th>
            <th className="px-6 py-3">Scramble</th>
          </tr>
        </thead>
        <tbody>
          {personAssignments.sort(byName).map((person) => (
            <Link
              key={person.registrantId}
              className="table-row hover:bg-slate-100"
              to={`/competitions/${wcif.id}/persons/${person.registrantId}`}>
              <td className="px-6 py-3">{person.name}</td>
              <td
                className="px-6 py-3 text-white"
                style={{
                  backgroundColor:
                    person.assignments.competingActivity?.parent?.room?.color || 'inherit',
                }}>
                {person.assignments.competingActivity
                  ? parseActivityCode(person.assignments.competingActivity.activityCode).groupNumber
                  : '-'}
              </td>
              <td className="px-6 py-3 text-white">
                {person.assignments.staffingActivities
                  .filter((s) => s.assignment.assignmentCode === 'staff-judge')
                  .map((s) => (
                    <span
                      className="p-3"
                      style={{ backgroundColor: s.activity?.parent?.room?.color || 'inherit' }}>
                      {s.activity ? parseActivityCode(s.activity.activityCode).groupNumber : '-'}
                    </span>
                  ))}
              </td>
              <td className="text-white">
                {person.assignments.staffingActivities
                  .filter((s) => s.assignment.assignmentCode === 'staff-scrambler')
                  .map((s) => (
                    <span
                      className="p-3"
                      style={{ backgroundColor: s.activity?.parent?.room?.color || 'inherit' }}>
                      {s.activity ? parseActivityCode(s.activity.activityCode).groupNumber : '-'}
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
