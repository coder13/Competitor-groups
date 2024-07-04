import { Fragment, useCallback, useMemo } from 'react';
import { Competition, Person } from '@wca/helpers';
import { getGroupedAssignmentsByDate } from './utils';
import { getAllActivities } from '../../lib/activities';
import { byDate, roundTime } from '../../lib/utils';
import { parseActivityCodeFlexible } from '../../lib/activityCodes';
import { useNow } from '../../hooks/useNow';
import { ExtraAssignment } from './PersonalExtraAssignment';
import { PersonalNormalAssignment } from './PersonalNormalAssignment';
import { isActivityWithRoomOrParent } from '../../lib/typeguards';

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
                  .sort((a, b) => byDate(a.activity, b.activity))
                  .map(({ date, assignment }, index, sortedAssignments) => {
                    const activity = assignment.activity;
                    if (!activity) {
                      return null;
                    }

                    const roundedStartTime = roundTime(new Date(activity.startTime || 0), 5);
                    const roundedEndTime = roundTime(new Date(activity.endTime || 0), 5);

                    const isOver = now > roundedEndTime;
                    const isCurrent = now > roundedStartTime && now < roundedEndTime;

                    if (
                      assignment.type === 'extra' ||
                      !('room' in activity || 'parent' in activity)
                    ) {
                      return (
                        <ExtraAssignment
                          key={`${date}-${roundedStartTime.toLocaleString()}-${
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

                    const { eventId, roundNumber, attemptNumber } = parseActivityCodeFlexible(
                      assignment.activity?.activityCode || ''
                    );

                    const venue = wcif?.schedule.venues?.find((v) =>
                      v.rooms.some((r) => {
                        if (activity.room) {
                          return r.id === activity.room.id;
                        } else if (activity.parent?.room) {
                          return r.id === activity.parent.room.id;
                        }

                        return false;
                      })
                    );
                    const timeZone = venue?.timezone || 'UTC';

                    const room = activity?.room || activity?.parent?.room;

                    if (!room) {
                      return null;
                    }

                    const roomName = room?.name;
                    const roomColor = room?.color;

                    let howManyNextAssignmentsAreSameRoundAttempt = 0;
                    for (let i = index + 1; i < sortedAssignments.length; i++) {
                      const nextAssignment = sortedAssignments[i];
                      if (!nextAssignment?.activity) {
                        break;
                      }

                      if (!isActivityWithRoomOrParent(nextAssignment.activity)) {
                        debugger;
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
                      isActivityWithRoomOrParent(previousAssignment.activity) &&
                      parseActivityCodeFlexible(previousAssignment?.activity?.activityCode);
                    const nextAssignmentActivityCode =
                      nextAssignment?.activity &&
                      isActivityWithRoomOrParent(nextAssignment.activity) &&
                      parseActivityCodeFlexible(nextAssignment?.activity?.activityCode);

                    const previousActivityIsSameRoundAttempt =
                      previousAssignmentActivityCode &&
                      previousAssignmentActivityCode?.eventId === eventId &&
                      previousAssignmentActivityCode?.roundNumber === roundNumber &&
                      previousAssignmentActivityCode?.attemptNumber === attemptNumber;

                    const nextActivityIsSameRoundAttempt =
                      nextAssignmentActivityCode &&
                      nextAssignmentActivityCode?.eventId === eventId &&
                      nextAssignmentActivityCode?.roundNumber === roundNumber &&
                      nextAssignmentActivityCode?.attemptNumber === attemptNumber;

                    const showTopBorder = !previousActivityIsSameRoundAttempt;
                    const showBottomBorder = !nextActivityIsSameRoundAttempt;

                    return (
                      <PersonalNormalAssignment
                        key={`${assignment.activityId}-${assignment.assignmentCode}`}
                        competitionId={wcif.id}
                        assignment={assignment}
                        activity={activity}
                        timeZone={timeZone}
                        room={{ name: roomName, color: roomColor }}
                        isCurrent={isCurrent}
                        isOver={isOver}
                        showTopBorder={showTopBorder}
                        showBottomBorder={showBottomBorder}
                        showRoom={showRoom}
                        showStationNumber={showStationNumber}
                        rowSpan={howManyNextAssignmentsAreSameRoundAttempt}
                      />
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
