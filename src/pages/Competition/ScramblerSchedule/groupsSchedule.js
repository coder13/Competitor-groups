import { useCallback, useMemo } from 'react';
import {
  activityCodeToName,
  allActivities,
  allRoundActivities,
  rooms,
} from '../../../lib/activities';
import { groupBy, groupByMap } from '../../../lib/utils';
import { useWCIF } from '../WCIFProvider';

const DaysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Keeping a snapshot of this because it presents the groups in a nice way visually
 */

export default function ScramblerSchedule() {
  const { wcif } = useWCIF();

  const _rooms = rooms(wcif);

  const _allRoundActivities = useMemo(
    () =>
      allRoundActivities(wcif)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .filter((activity) => activity.childActivities.length !== 0),
    [wcif]
  );
  const _allActivities = useMemo(() => allActivities(wcif), [wcif]);

  const getActivity = useCallback(
    (assignment) => _allActivities.find(({ id }) => id === assignment.activityId),
    [_allActivities]
  );

  // const assignments = useMemo(
  //   () =>
  //     flatMap(wcif.persons, (person) =>
  //       person.assignments
  //         .filter((assignment) => assignment.assignmentCode === 'staff-scrambler')
  //         .map((assignment) => ({
  //           ...assignment,
  //           activity: getActivity(assignment),
  //         }))
  //     ),
  //   [getActivity, wcif.persons]
  // );

  const activitiesSplitAcrossDates = groupByMap(
    _allRoundActivities.map((activity) => ({
      ...activity,
      date: DaysOfWeek[new Date(activity.startTime).getDay()],
    })),
    (x) => x.date,
    (activities) => groupBy(activities, (activity) => activity.activityCode)
  );

  debugger;

  return (
    <div>
      <p>Scrambler Schedule</p>
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr>
            <th>Event</th>
            {_rooms.map((room) => (
              <th className="py-2 text-center">{room.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(activitiesSplitAcrossDates).map(([date, activityCodes]) => (
            <>
              <tr key={date}>
                <td colSpan={1 + _rooms.length} className="text-center font-bold">
                  {date}
                </td>
              </tr>
              {Object.entries(activityCodes).map(([activityCode, rooms]) => (
                <>
                  <tr key={activityCode}>
                    <td>{activityCodeToName(activityCode)}</td>
                  </tr>
                  {Array(Math.max(...rooms.map((a) => a.childActivities.length)))
                    .fill(1)
                    .map((x, i) => (
                      <tr>
                        <td>Group {i}</td>
                        {rooms.map((roundActivity) => (
                          <td key={roundActivity.id}>
                            {roundActivity.childActivities[i] && (
                              <td>
                                {
                                  activityCodeToName(
                                    roundActivity.childActivities[i].activityCode
                                  ).split(', ')[2]
                                }
                              </td>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
