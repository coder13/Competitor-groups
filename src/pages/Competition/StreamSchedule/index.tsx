import { parseActivityCode } from '@wca/helpers';
import { useCallback, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DisclaimerText } from '@/components';
import { streamActivities, streamPersonIds } from '@/lib/activities';
import { formatDate, formatToParts } from '@/lib/time';
import { roundTime } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined,
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

export default function CompetitionStreamSchedule() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    if (wcif) {
      setTitle(wcif?.name + ' Stream Schedule');
    }
  }, [wcif, setTitle]);

  const activities = wcif ? streamActivities(wcif) : [];

  const getPersonById = useCallback(
    (personId) => {
      return wcif?.persons.find(({ wcaUserId }) => wcaUserId === personId);
    },
    [wcif],
  );

  const activitiesWithParsedDate = activities
    .map((a) => ({
      ...a,
      date: formatDate(new Date(a.startTime)),
    }))
    .sort(byDate);

  const getActivitiesByDate = useCallback(
    (date) => {
      return activitiesWithParsedDate.filter((a) => a.date === date);
    },
    [activitiesWithParsedDate],
  );

  const scheduleDays = activities
    .map((a) => {
      const dateTime = new Date(a.startTime);
      return {
        approxDateTime: dateTime.getTime(),
        date: formatDate(dateTime) || 'foo',
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  if (!wcif) {
    return <p>Loading...</p>;
  }

  const renderActivities = () => (
    <>
      <h4 className="text-xl mb-2 text-center">Live Stream</h4>
      <div className="shadow-md">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-100 shadow-sm">
              <th className="py-2 text-center">Time</th>
              <th className="py-2 text-center">Event</th>
              <th className="py-2 text-center">Round</th>
              <th className="py-2 text-center">Group</th>
              <th className="py-2 text-center">Stage</th>
              <th className="py-2 text-center">Featured Competitors</th>
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
                {getActivitiesByDate(date)
                  .sort(byDate)
                  .map((activity) => {
                    const { eventId, roundNumber, groupNumber } = parseActivityCode(
                      activity.activityCode,
                    );

                    const venue = wcif.schedule.venues?.find((v) =>
                      v.rooms.some((r) => r.id === activity?.parent?.room?.id),
                    );
                    const timeZone = venue?.timezone;

                    const roomName = activity?.room?.name || activity?.parent?.room?.name;
                    const roomColor = activity?.room?.color || activity?.parent?.room?.color;
                    const startTime = roundTime(
                      new Date(activity?.startTime || 0),
                      5,
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone,
                    });

                    return (
                      <Link
                        key={`${activity.id}`}
                        className="table-row text-xs even:bg-slate-50 hover:bg-slate-100"
                        to={`/competitions/${wcif.id}/activities/${activity.id}`}>
                        <td className="py-2 text-center">{startTime}</td>
                        <td className="py-2 text-center">
                          <span className={`cubing-icon event-${eventId} mx-1 text-xl`} />
                        </td>
                        <td className="py-2 text-center">{roundNumber}</td>
                        <td className="py-2 text-center">{groupNumber || '*'}</td>
                        <td className="py-2 text-center">
                          <span
                            className="px-[6px]  py-[4px]  rounded-md"
                            style={{
                              backgroundColor: roomColor ? `${roomColor}70` : 'inherit',
                            }}>
                            {roomName}
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          {streamPersonIds(activity)
                            .map(getPersonById)
                            .filter((person) => !!person)
                            .map((person) => (
                              <p key={person.registrantId}>{person!.name}</p>
                            ))}
                        </td>
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
      <DisclaimerText />
      <hr className="my-2" />

      {activities.length > 0 ? renderActivities() : <div>No Live Stream information</div>}
    </div>
  );
}
