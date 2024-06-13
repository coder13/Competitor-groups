import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useCallback, useEffect, useMemo, Fragment, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWCIF } from '../WCIFProvider';
import { ActivityWithRoomOrParent, parseActivityCode, rooms } from '../../../lib/activities';
import AssignmentLabel from '../../../components/AssignmentLabel/AssignmentLabel';
import { parseActivityCodeFlexible, roundTime } from '../../../lib/utils';
import DisclaimerText from '../../../components/DisclaimerText';
import { shortEventNameById } from '../../../lib/events';
import classNames from 'classnames';
import { Extension } from '@wca/helpers/lib/models/extension';
import { Person } from '@wca/helpers';
import { Container } from '../../../components/Container';

const worldsAssignmentMap = {
  'wca booth': 'WCA Booth',
  'help desk': 'Help Desk',
  data: 'Data Entry',
  commentary: 'Commentary',
  media: 'Media',
};

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

export default function PersonPage() {
  const { wcif, setTitle } = useWCIF();
  const { registrantId } = useParams();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const person = wcif?.persons?.find(
    (p) => p.registrantId.toString() === registrantId
  ) as Person & {
    extensions: Extension[];
  };

  useEffect(() => {
    if (person) {
      setTitle(person.name);
    }
  }, [person, setTitle]);

  const showRoom = wcif ? rooms(wcif).length > 1 : false;

  // Get only group activities (children of round Activities)
  const _allActivities = useMemo(
    () =>
      (wcif
        ? rooms(wcif)
            .flatMap((room) => [
              ...room.activities.map((a) => ({ ...a, room })),
              ...room.activities.flatMap((ra) =>
                ra.childActivities?.map((ca) => ({
                  ...ca,
                  parent: {
                    ...ra,
                    room,
                  },
                }))
              ),
            ])
            .filter(Boolean)
        : []) as ActivityWithRoomOrParent[],
    [wcif]
  );

  const getActivity = useCallback(
    (assignment) => _allActivities.find(({ id }) => id === assignment.activityId),
    [_allActivities]
  );

  const assignments = useMemo(
    () =>
      person?.assignments
        ? person?.assignments
            ?.map((assignment) => ({
              ...assignment,
              activity: _allActivities.find(({ id }) => id === assignment.activityId),
            }))
            .sort((a, b) => byDate(a.activity, b.activity))
        : [],
    [_allActivities, person?.assignments]
  );

  console.log(108, wcif, person, assignments);

  const anyAssignmentsHasStationNumber = useMemo(
    () => assignments.some((a) => !!a.stationNumber),
    [assignments]
  );

  const extraAssignments =
    (
      person?.extensions?.find(({ id }) => id === 'com.competitiongroups.worldsassignments')
        ?.data as {
        assignments?: Array<{
          staff: string;
          startTime: string;
          endTime: string;
        }>;
      }
    )?.assignments?.map((assignment) => ({
      assignmentCode: assignment.staff,
      activityId: null,
      activity: {
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        room: { id: null },
        parent: null,
      },
    })) ?? [];

  const allAssignments = [...assignments, ...extraAssignments].sort((a, b) =>
    byDate(a.activity, b.activity)
  );

  const assignmentsWithParsedDate = allAssignments
    .map((a) => {
      const venue = a?.activity?.room?.id
        ? wcif?.schedule.venues?.find((v) =>
            v.rooms.some(
              (r) => r.id === a.activity?.room?.id || r.id === a.activity?.parent?.room?.id
            )
          )
        : wcif?.schedule.venues?.[0];

      const dateTime = a.activity ? new Date(a.activity.startTime) : new Date(0);

      return {
        ...a,
        date:
          dateTime?.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: venue?.timezone,
          }) ?? 'foo',
      };
    })
    .sort((a, b) => byDate(a.activity, b.activity));

  const getAssignmentsByDate = useCallback(
    (date) => {
      return assignmentsWithParsedDate.filter((a) => a.date === date);
    },
    [assignmentsWithParsedDate]
  );

  const scheduleDays = allAssignments
    .map((a) => {
      const venue = a?.activity?.room?.id
        ? wcif?.schedule.venues?.find((v) =>
            v.rooms.some((r) => r.id === a.activity?.room?.id || a.activity?.parent?.room?.id)
          )
        : wcif?.schedule.venues?.[0];

      const dateTime = a.activity ? new Date(a.activity.startTime) : new Date(0);

      return {
        approxDateTime: dateTime.getTime(),
        date:
          dateTime.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: venue?.timezone,
          }) ?? 'foo',
        dateParts: new Intl.DateTimeFormat(navigator.language, {
          weekday: 'long',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: venue?.timezone,
        }).formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  if (!person) {
    return <p>Loading...</p>;
  }

  console.log(person.assignments);

  const renderAssignments = () => (
    <>
      <div className="shadow-md">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 shadow-sm">
              <th className="py-2 text-center w-43">Activity</th>
              <th className="py-2 text-center">Time</th>
              <th className="py-2 text-center">Assignment</th>
              <th className="py-2 text-center">Group</th>
              {showRoom && <th className="py-2 text-center">Stage</th>}
              {anyAssignmentsHasStationNumber && <th className="py-2 text-center">Station</th>}
            </tr>
          </thead>
          <tbody>
            {scheduleDays
              .filter(({ date }) => getAssignmentsByDate(date).length)
              .map(({ date, dateParts }) => (
                <Fragment key={date}>
                  {scheduleDays.length > 1 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="font-bold text-base md:text-lg text-center py-2 bg-slate-50">
                        Assignments for {dateParts.find((i) => i.type === 'weekday')?.value || date}
                      </td>
                    </tr>
                  )}
                  {getAssignmentsByDate(date)
                    .map((assignment) => ({
                      assignment,
                      activity: getActivity(assignment),
                    }))
                    .sort((a, b) => byDate(a.assignment.activity, b.assignment.activity))
                    .map(({ assignment, activity }, index, sortedAssignments) => {
                      if (!activity?.id) {
                        const roundedStartTime = roundTime(
                          new Date(assignment.activity?.startTime || 0),
                          5
                        );
                        const roundedEndTime = roundTime(
                          new Date(assignment.activity?.endTime || 0),
                          5
                        );

                        const formattedStartTime = roundedStartTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: wcif?.schedule?.venues?.[0]?.timezone,
                        });
                        const formattedEndTime = roundedEndTime.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: wcif?.schedule?.venues?.[0]?.timezone,
                        });

                        const isOver = now > roundedEndTime;
                        const isCurrent = now > roundedStartTime && now < roundedEndTime;

                        return (
                          <tr
                            key={`${assignment.date}-${formattedStartTime}-${assignment.assignmentCode}`}
                            className={classNames(
                              'table-row text-xs sm:text-sm hover:bg-slate-100 border-y',
                              {
                                'opacity-40': isOver,
                                'bg-op': isCurrent,
                              }
                            )}>
                            <td colSpan={2} className="py-2 text-center">
                              {formattedStartTime} - {formattedEndTime}
                            </td>
                            <td colSpan={1} className="py-2 text-center">
                              {worldsAssignmentMap[assignment.assignmentCode]}
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        );
                      }

                      if (!assignment.activityId) {
                        return;
                      }

                      const { eventId, roundNumber, groupNumber, attemptNumber } =
                        parseActivityCodeFlexible(activity?.activityCode || '');

                      const venue = wcif?.schedule.venues?.find((v) =>
                        v.rooms.some(
                          (r) => r.id === activity?.room?.id || activity?.parent?.room?.id
                        )
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
                          {anyAssignmentsHasStationNumber && (
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

  return (
    <Container>
      <div className="flex flex-col p-1">
        <div className="p-1">
          <div className="flex justify-between items-center">
            <div className="flex flex-shrink items-center">
              <h3 className="text-xl sm:text-2xl">{person.name}</h3>
              {hasFlag(person.countryIso2) && (
                <div className="flex flex-shrink ml-2 text-lg sm:text-xl">
                  {getUnicodeFlagIcon(person.countryIso2)}
                </div>
              )}
            </div>
            <span className="text-xl sm:text-2xl">{person.registrantId}</span>
          </div>
          {person.wcaId && (
            <Link
              to={`/competitions/${wcif?.id}/personal-bests/${person.wcaId}`}
              className="text-sm sm:text-base text-blue-800 hover:underline">
              {person.wcaId}
            </Link>
          )}
          <p className="text-sm sm:text-md">
            <span>Registered Events:</span>
            {person.registration?.eventIds.map((eventId) => (
              <span key={eventId} className={`cubing-icon event-${eventId} mx-1 text-lg`} />
            ))}
          </p>
        </div>
        <hr className="my-2" />
        <DisclaimerText />
        <hr className="my-2" />
        {person?.assignments && person.assignments.length > 0 ? (
          renderAssignments()
        ) : (
          <div>No Assignments</div>
        )}
      </div>
    </Container>
  );
}
