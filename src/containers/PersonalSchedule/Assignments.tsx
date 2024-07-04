import { Fragment, useCallback, useMemo } from 'react';
import { Competition, Person } from '@wca/helpers';
import { getGroupedAssignmentsByDate } from './utils';
import { getAllActivities } from '../../lib/activities';
import { byDate, roundTime } from '../../lib/utils';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { parseActivityCodeFlexible } from '../../lib/activityCodes';
import { useNow } from '../../hooks/useNow';
import { shortEventNameById } from '../../lib/events';
import AssignmentLabel from '../../components/AssignmentLabel/AssignmentLabel';
import { worldsAssignmentMap } from './constants';
import { ExtraAssignment } from './PersonalAssignment';

export interface AssignmentsProps {
  wcif: Competition;
  person: Person;
  showRoom: boolean;
  showStationNumber: boolean;
}

export function Assignments({ wcif, person, showRoom, showStationNumber }: AssignmentsProps) {
  const now = useNow(15 * 1000);
  const allActivities = useMemo(() => getAllActivities(wcif), [wcif]);

  const scheduleDays = useMemo(() => getGroupedAssignmentsByDate(wcif, person), []);

  const isSingleDay = scheduleDays.length === 1;

  const getActivity = useCallback(
    (assignment) => allActivities.find(({ id }) => id === assignment.activityId),
    []
  );

  return (
    <>
      <div className="shadow-md">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 shadow-sm">
              <th className="py-2 text-center w-20">Activity</th>
              <th className="py-2 text-center">Time</th>
              <th className="py-2 text-center">Assignment</th>
              <th className="py-2 text-center">Group</th>
              {showRoom && <th className="py-2 text-center">Stage</th>}
              {showStationNumber && <th className="py-2 text-center">Station</th>}
            </tr>
          </thead>
          <tbody>
            {scheduleDays.map(({ date, dateParts, assignments }) => (
              <Fragment key={date}>
                {!isSingleDay && (
                  <tr>
                    <td
                      colSpan={6}
                      className="font-bold text-base md:text-lg text-center py-2 bg-slate-50">
                      Assignments for {dateParts.find((i) => i.type === 'weekday')?.value || date}
                    </td>
                  </tr>
                )}
                {assignments
                  .map((assignment) => ({
                    assignment,
                    activity: getActivity(assignment),
                  }))
                  .sort((a, b) => byDate(a.assignment.activity, b.assignment.activity))
                  .map(({ assignment, activity }, index, sortedAssignments) => {
                    if (!activity?.id) {
                      const roundedStartTime = roundTime(
                        new Date(assignment.activity.startTime || 0),
                        5
                      );
                      const roundedEndTime = roundTime(
                        new Date(assignment.activity.endTime || 0),
                        5
                      );

                      const isOver = now > roundedEndTime;
                      const isCurrent = now > roundedStartTime && now < roundedEndTime;

                      console.log(81);

                      return (
                        <ExtraAssignment
                          key={`${assignment.date}-${roundedStartTime.toLocaleString()}-${
                            assignment.assignmentCode
                          }`}
                          assignment={assignment}
                          isOver={isOver}
                          isCurrent={isCurrent}
                          startTime={roundedStartTime}
                          endTime={roundedEndTime}
                          timeZone={wcif.schedule.venues[0]?.timezone}
                        />
                      );
                    }

                    if (!assignment.activityId) {
                      return null;
                    }

                    const { eventId, roundNumber, groupNumber, attemptNumber } =
                      parseActivityCodeFlexible(activity?.activityCode || '');

                    const venue = wcif?.schedule.venues?.find((v) =>
                      v.rooms.some((r) => r.id === activity?.room?.id || activity?.parent?.room?.id)
                    );
                    const timeZone = venue?.timezone;

                    const room = activity?.room || activity?.parent?.room;
                    const roomName = room?.name;
                    const roomColor = room?.color;
                    const roundedStartTime = roundTime(new Date(activity?.startTime || 0), 5);
                    const roundedEndTime = roundTime(new Date(activity?.endTime || 0), 5);

                    const formattedStartTime = roundedStartTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone,
                    });

                    const isOver = now > roundedEndTime;
                    const isCurrent = now > roundedStartTime && now < roundedEndTime;

                    let howManyNextAssignmentsAreSameRoundAttempt = 0;
                    for (let i = index + 1; i < sortedAssignments.length; i++) {
                      const nextAssignment = sortedAssignments[i];
                      if (!nextAssignment?.activity) {
                        break;
                      }

                      const {
                        eventId: nextAssignmentEventId,
                        roundNumber: nextAssignmentRoundNumber,
                        attemptNumber: nextAssignmentAttemptNumber,
                      } = parseActivityCodeFlexible(nextAssignment.activity.activityCode);
                      if (
                        eventId === nextAssignmentEventId &&
                        roundNumber === nextAssignmentRoundNumber &&
                        attemptNumber === nextAssignmentAttemptNumber
                      ) {
                        howManyNextAssignmentsAreSameRoundAttempt++;
                      } else {
                        break;
                      }
                    }

                    const previousAssignment = sortedAssignments[index - 1];
                    const nextAssignment = sortedAssignments[index + 1];
                    const previousAssignmentActivityCode =
                      previousAssignment?.activity &&
                      parseActivityCodeFlexible(previousAssignment?.activity?.activityCode);
                    const nextAssignmentActivityCode =
                      nextAssignment?.activity &&
                      parseActivityCodeFlexible(nextAssignment?.activity?.activityCode);

                    const previousActivityIsSameRoundAttempt =
                      previousAssignmentActivityCode?.eventId === eventId &&
                      previousAssignmentActivityCode?.roundNumber === roundNumber &&
                      previousAssignmentActivityCode?.attemptNumber === attemptNumber;

                    const nextActivityIsSameRoundAttempt =
                      nextAssignmentActivityCode?.eventId === eventId &&
                      nextAssignmentActivityCode?.roundNumber === roundNumber &&
                      nextAssignmentActivityCode?.attemptNumber === attemptNumber;

                    return (
                      <Link
                        key={`${assignment.activityId}-${assignment.assignmentCode}`}
                        style={{
                          ...(isCurrent && {
                            backgroundColor: `${roomColor}25`,
                          }),
                        }}
                        className={classNames('table-row text-xs sm:text-sm hover:bg-slate-100', {
                          'opacity-40': isOver,
                          'bg-op': isCurrent,
                          'border-t':
                            !previousActivityIsSameRoundAttempt || eventId.toString() === 'other',
                          'border-b':
                            !nextActivityIsSameRoundAttempt || eventId.toString() === 'other',
                        })}
                        to={`/competitions/${wcif?.id}/activities/${assignment.activityId}`}>
                        {!previousActivityIsSameRoundAttempt && (
                          <td
                            className="py-2 text-center justify-center"
                            rowSpan={howManyNextAssignmentsAreSameRoundAttempt + 1}>
                            {activity?.activityCode.startsWith('other')
                              ? activity?.name
                              : [
                                  `${shortEventNameById(eventId)}`,
                                  `${roundNumber && roundNumber > 1 ? `R${roundNumber}` : ''}`,
                                  `${attemptNumber ? `A${attemptNumber}` : ''}`,
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                          </td>
                        )}
                        <td className="py-2 text-center">{formattedStartTime}</td>
                        <td className="py-2 text-center">
                          <AssignmentLabel assignmentCode={assignment.assignmentCode} />
                        </td>
                        <td className="py-2 text-center text-base sm:text-lg">{groupNumber}</td>
                        {showRoom && (
                          <td
                            className="py-2 text-center"
                            style={{
                              lineHeight: 2,
                            }}>
                            <span
                              className="px-[6px]  py-[4px]  rounded-md"
                              style={{
                                backgroundColor: roomColor ? `${roomColor}70` : 'inherit',
                              }}>
                              {roomName}
                            </span>
                          </td>
                        )}
                        {showStationNumber && (
                          <td className="py-2 text-center">{assignment.stationNumber}</td>
                        )}
                      </Link>
                    );
                  })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
