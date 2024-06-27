import { useCallback, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { allChildActivities } from '../../../lib/activities';
import { useWCIF } from '../../../providers/WCIFProvider';
import ActivityRow from '../../../components/ActivitiyRow';
import { byDate, formatToParts } from '../../../lib/utils';
import { Container } from '../../../components/Container';

export function CompetitionRoom() {
  const { wcif, setTitle } = useWCIF();
  const { roomId } = useParams();

  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const venue = wcif?.schedule?.venues?.find((venue) =>
    venue.rooms.some((room) => room.id.toString() === roomId)
  );
  const room = venue?.rooms?.find((room) => room.id.toString() === roomId);

  const timeZone = venue?.timezone ?? wcif?.schedule.venues?.[0]?.timezone ?? '';

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
    .map((activity) => {
      const venue =
        wcif?.schedule.venues?.find((v) =>
          v.rooms.some((r) =>
            r.activities.some(
              (a) => a.id === activity.id || a.childActivities?.some((ca) => ca.id === activity.id)
            )
          )
        ) || wcif?.schedule.venues?.[0];

      const dateTime = new Date(activity.startTime);

      return {
        approxDateTime: dateTime.getTime(),
        date: dateTime.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: venue?.timezone,
        }),
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  const activitiesWithParsedDate = activities
    .map((activity) => {
      const venue =
        wcif?.schedule.venues?.find((v) =>
          v.rooms.some((r) =>
            r.activities.some(
              (a) => a.id === activity.id || a.childActivities?.some((ca) => ca.id === activity.id)
            )
          )
        ) || wcif?.schedule.venues?.[0];

      const dateTime = new Date(activity.startTime);

      return {
        ...activity,
        date: dateTime.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          timeZone: venue?.timezone,
        }),
      };
    })
    .sort((a, b) => byDate(a, b));

  const getActivitiesByDate = useCallback(
    (date) => {
      return activitiesWithParsedDate.filter((a) => a.date === date);
    },
    [activitiesWithParsedDate]
  );

  return (
    <Container>
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
        <hr className="my-2" />
        <div className="flex flex-row justify-between">
          <Link
            to={`/competitions/${wcif?.id}/rooms`}
            className="w-full border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row">
            Back to list of Rooms
          </Link>
        </div>
      </div>
    </Container>
  );
}
