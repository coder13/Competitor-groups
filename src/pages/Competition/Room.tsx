import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { allChildActivities } from '../../lib/activities';
import { useWCIF } from './WCIFProvider';
import ActivityRow from '../../components/ActivitiyRow';
import { byDate, formatDate, formatToParts } from '../../lib/utils';

export default function Round() {
  const { wcif, setTitle } = useWCIF();
  const { roomId } = useParams();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const venue = wcif?.schedule?.venues?.find((venue) =>
    venue.rooms.some((room) => room.id.toString() === roomId)
  );
  const room = venue?.rooms?.find((room) => room.id.toString() === roomId);

  const timeZone = venue?.timezone ?? wcif.schedule.venues?.[0]?.timezone ?? '';

  const activities = useMemo(
    () =>
      room?.activities
        .flatMap((activity) =>
          activity?.childActivities?.length ? allChildActivities(activity) : activity
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [],
    [room?.activities]
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
      <div className="p-2">
        <h3 className="font-bold text-lg -mb-2">{room?.name}</h3>
        <span className="text-xs">{venue?.name}</span>
      </div>

      {scheduleDays.map((day) => (
        <div key={day.date} className="flex flex-col">
          <p className="w-full text-center bg-slate-50 font-bold text-lg mb-1">{day.date}</p>
          <div className="flex flex-col">
            {getActivitiesByDate(day.date).map((activity) => {
              return (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  timeZone={timeZone}
                  room={room}
                  showRoom={false}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
