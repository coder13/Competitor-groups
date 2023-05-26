import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import tw from 'tailwind-styled-components';
import styled from 'styled-components';
import { useCallback, useEffect, useMemo, Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWCIF } from '../WCIFProvider';
import { parseActivityCode, rooms } from '../../../lib/activities';
import AssignmentLabel from '../../../components/AssignmentLabel/AssignmentLabel';
import { formatDate, formatToParts, roundTime } from '../../../lib/utils';
import DisclaimerText from '../../../components/DisclaimerText';

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

const RoundedBg = tw.span`
  px-[6px]
  py-[4px]
  rounded-md
`;

const RoomColored = styled(RoundedBg)`
  background-color: ${(p) => (p.$color ? `${p.$color}70` : 'inherit')};
`;

export default function Person() {
  const { wcif, setTitle } = useWCIF();
  const { registrantId } = useParams();

  const person = wcif.persons.find((p) => p.registrantId.toString() === registrantId);

  useEffect(() => {
    if (person) {
      setTitle(person.name);
    }
  }, [person, setTitle]);

  // Get only group activities (children of round Activities)
  const _allActivities = useMemo(
    () =>
      rooms(wcif)
        .flatMap((room) =>
          room.activities.flatMap((ra) =>
            ra.childActivities?.map((ca) => ({
              ...ca,
              parent: {
                ...ra,
                room,
              },
            }))
          )
        )
        .filter(Boolean),
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
              activity: _allActivities.find(({ id }) => id === parseInt(assignment.activityId, 10)),
            }))
            .sort((a, b) => byDate(a.activity, b.activity))
        : [],
    [_allActivities, person?.assignments]
  );

  const anyAssignmentsHasStationNumber = useMemo(
    () => assignments.some((a) => !!a.stationNumber),
    [assignments]
  );

  const assignmentsWithParsedDate = assignments
    .map((a) => ({
      ...a,
      date: a.activity ? formatDate(new Date(a.activity.startTime)) : '???',
    }))
    .sort((a, b) => byDate(a.activity, b.activity));

  const getAssignmentsByDate = useCallback(
    (date) => {
      return assignmentsWithParsedDate.filter((a) => a.date === date);
    },
    [assignmentsWithParsedDate]
  );

  const scheduleDays = assignments
    .map((a) => {
      const dateTime = a.activity ? new Date(a.activity.startTime) : new Date(0);
      return {
        approxDateTime: dateTime.getTime(),
        date: formatDate(dateTime) || 'foo',
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  if (!person) {
    return <p>Loading...</p>;
  }

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
              {anyAssignmentsHasStationNumber && <th className="py-2 text-center">Station</th>}
            </tr>
          </thead>
          <tbody>
            {scheduleDays.map(({ date, dateParts }) => (
              <Fragment key={date}>
                <tr>
                  <td colSpan={6} className="font-bold text-lg text-center py-2">
                    {dateParts.find((i) => i.type === 'weekday')?.value || date}
                  </td>
                </tr>
                {getAssignmentsByDate(date)
                  .map((assignment) => ({ assignment, activity: getActivity(assignment) }))
                  .sort((a, b) => byDate(a.activity, b.activity))
                  .map(({ assignment, activity }) => {
                    const { eventId, roundNumber, groupNumber } = parseActivityCode(
                      activity?.activityCode || ''
                    );

                    const venue = wcif.schedule.venues?.find((v) =>
                      v.rooms.some((r) => r.id === activity?.parent?.room?.id)
                    );
                    const timeZone = venue?.timezone;

                    const roomName = activity?.parent?.room?.name;
                    const roomColor = activity?.parent?.room?.color;
                    const startTime = roundTime(
                      new Date(activity?.startTime || 0),
                      5
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone,
                    });

                    return (
                      <Link
                        key={`${assignment.activityId}-${assignment.assignmentCode}`}
                        className="table-row text-xs even:bg-slate-50 hover:bg-slate-100"
                        to={`/competitions/${wcif.id}/activities/${assignment.activityId}`}>
                        <td className="py-2 text-center">{startTime}</td>
                        <td className="py-2 text-center">
                          <span className={`cubing-icon event-${eventId} mx-1 text-xl`} />
                        </td>
                        <td className="py-2 text-center">{roundNumber}</td>
                        <td className="py-2 text-center">{groupNumber || '*'}</td>
                        <td className="py-2 text-center">
                          <RoomColored $color={roomColor}>{roomName}</RoomColored>
                        </td>
                        <td className="py-2 text-center">
                          <AssignmentLabel assignmentCode={assignment.assignmentCode} />
                        </td>
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
    <div className="flex flex-col p-1">
      <div className="p-1">
        <div className="flex justify-between items-center">
          <div className="flex flex-shrink items-center">
            <h3 className="text-2xl">{person.name}</h3>
            {hasFlag(person.countryIso2) && (
              <div className="flex flex-shrink ml-2 text-xl">
                {getUnicodeFlagIcon(person.countryIso2)}
              </div>
            )}
          </div>
          <span className="text-2xl">{person.registrantId}</span>
        </div>
        {person.wcaId && <p className="text-sm">{person.wcaId}</p>}
        <p className="text-md">
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
  );
}
