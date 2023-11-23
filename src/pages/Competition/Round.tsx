import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ActivityWithRoomOrParent,
  activityCodeToName,
  groupActivitiesByRound,
  parseActivityCode,
} from '../../lib/activities';
import { byName, formatDateTimeRange } from '../../lib/utils';
import { useWCIF } from './WCIFProvider';
import { Activity, Assignment, Room } from '@wca/helpers';
import Assignments, { AssignmentsMap } from '../../lib/assignments';
import classNames from 'classnames';

export default function Round() {
  const { wcif, setTitle } = useWCIF();
  const { roundId: activityCode } = useParams() as { roundId: string };

  const groups = useMemo(
    () => (wcif ? groupActivitiesByRound(wcif, activityCode) : []),
    [activityCode, wcif]
  );

  useEffect(() => {
    setTitle(activityCodeToName(activityCode));
  }, [activityCode, setTitle]);

  const stages = wcif?.schedule?.venues?.flatMap((venue) => venue.rooms);
  const roundActivities = stages
    ?.map((room) => {
      const round = room.activities.find(
        (a) => a.activityCode === activityCode
      );
      return round ? { ...round, room } : round;
    })
    .filter((x) => x?.room) as Array<Activity & { room: Room }>;

  const personAssignments = useMemo(() => {
    return wcif
      ? wcif.persons
          .map((person) => ({
            ...person,
            assignments: (person.assignments
              ?.filter((a) => groups.find((g) => g.id === a.activityId))
              .map((a) => ({
                ...a,
                activity: groups.find((g) => g.id === a.activityId),
              })) || []) as Array<
              Assignment & { activity: ActivityWithRoomOrParent }
            >,
          }))
          .filter((person) => person.assignments.length > 0)
      : [];
  }, [groups, wcif]);

  const sortedPersons = personAssignments.sort(byName);
  console.log(sortedPersons);

  return (
    <div className="p-2 space-y-2">
      <h3 className="text-2xl">{activityCodeToName(activityCode)}</h3>
      {roundActivities?.map((s) => (
        <div
          style={{
            border: '1px solid',
            borderColor: `${s.room.color}`,
            borderRadius: 5,
          }}>
          <div className="px-2 py-2">
            <h3 className="text-xl">{s.room.name}</h3>
            <h5 className="text-sm">
              {formatDateTimeRange(s.startTime, s.endTime)}
            </h5>
          </div>
          <table className="text-left text-xs w-full">
            <thead>
              <tr>
                <th className="px-3 py-2">Name</th>
                {s.childActivities.map((a) => {
                  const { groupNumber } = parseActivityCode(a.activityCode);
                  return (
                    <th key={a.id} className="px-3 py-2 text-center">
                      {groupNumber}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedPersons
                .filter((p) =>
                  p.assignments.some(
                    (a) => a.activity.parent?.room?.id === s.room.id
                  )
                )
                .map((person) => (
                  <Link
                    key={person.registrantId}
                    className="table-row hover:bg-slate-100"
                    to={`/competitions/${wcif?.id}/persons/${person.registrantId}`}>
                    <td className="px-3 py-2">{person.name}</td>
                    {s.childActivities.map((a) => {
                      const assignment = person.assignments.find(
                        (g) => g.activity.id === a.id
                      );
                      const assignmentConfig =
                        AssignmentsMap[assignment?.assignmentCode || ''];
                      if (assignment?.assignmentCode === 'competitor') {
                        console.log(assignmentConfig);
                      }

                      return (
                        <td
                          key={person.registrantId + a.id}
                          className={classNames(`text-center`, {
                            ['bg-green-200']:
                              assignmentConfig?.color === 'green',
                            ['bg-red-200']: assignmentConfig?.color === 'red',
                            ['bg-blue-200']: assignmentConfig?.color === 'blue',
                            ['bg-yellow-200']:
                              assignmentConfig?.color === 'yellow',
                            ['bg-purple-200']:
                              assignmentConfig?.color === 'purple',
                            ['bg-indigo-200']:
                              assignmentConfig?.color === 'indigo',
                            ['bg-pink-200']: assignmentConfig?.color === 'pink',
                            ['bg-grey-200']: assignmentConfig?.color === 'grey',
                          })}>
                          {assignmentConfig?.letter || ''}
                        </td>
                      );
                    })}
                  </Link>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
