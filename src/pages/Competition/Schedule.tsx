import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DisclaimerText from '../../components/DisclaimerText';
import { allActivities } from '../../lib/activities';
import { useWCIF } from './WCIFProvider';
import ActivityRow from '../../components/ActivitiyRow';
import { byDate, formatDate, formatToParts } from '../../lib/utils';

export default function Round() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const activities = useMemo(
    () =>
      allActivities(wcif)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .filter((activity) => activity.childActivities.length === 0),
    [wcif]
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

  const activitiesWithParsedDate = activities
    .map((a) => ({
      ...a,
      date: formatDate(new Date(a.startTime)),
    }))
    .sort((a, b) => byDate(a, b));

  const getActivitiesByDate = useCallback(
    (date) => {
      return activitiesWithParsedDate.filter((a) => a.date === date);
    },
    [activitiesWithParsedDate]
  );

  return (
    <div className="flex w-full flex-col text-sm md:text-base py-2">
      <DisclaimerText />
      <hr className="my-2" />
      <div className="flex flex-row justify-between">
        <Link
          to={`/competitions/${wcif.id}/rooms`}
          className="w-full border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row">
          View by Room
        </Link>
      </div>
      <hr className="my-2" />
      {scheduleDays.map((day) => (
        <div key={day.date} className="flex flex-col">
          <p className="w-full text-center bg-slate-50 font-bold text-lg mb-1">{day.date}</p>
          <div className="flex flex-col">
            {getActivitiesByDate(day.date).map((activity) => {
              const venue = wcif.schedule.venues?.find((v) =>
                v.rooms.some(
                  (r) =>
                    r.id === activity.parent?.parent?.room?.id ||
                    r.id === activity.parent?.room?.id ||
                    activity?.room?.id
                )
              );
              const timeZone = venue?.timezone ?? wcif.schedule.venues?.[0]?.timezone ?? '';

              return (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  timeZone={timeZone}
                  room={activity?.parent?.parent?.room || activity?.parent?.room || activity?.room}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
