import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ActivityRow, Container } from '@/components';
import { getAllChildActivities, getRoomData } from '@/lib/activities';
import { formatToParts } from '@/lib/time';
import { byDate } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export function CompetitionRoom() {
  const { t } = useTranslation();

  const { wcif, setTitle } = useWCIF();
  const { roomId } = useParams();

  const venue = useMemo(
    () =>
      wcif?.schedule?.venues?.find((venue) =>
        venue.rooms.some((room) => room.id.toString() === roomId),
      ),
    [roomId, wcif?.schedule?.venues],
  );

  const room = useMemo(
    () => venue?.rooms?.find((room) => room.id.toString() === roomId),
    [roomId, venue?.rooms],
  );

  useEffect(() => {
    setTitle(room?.name || '');
  }, [room, setTitle]);

  const timeZone = venue?.timezone ?? wcif?.schedule.venues?.[0]?.timezone ?? '';

  const activities = useMemo(
    () =>
      room?.activities
        .flatMap((activity) =>
          activity?.childActivities?.length ? getAllChildActivities(activity) : activity,
        )
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [],
    [room?.activities],
  );

  const scheduleDays = activities
    .map((activity) => {
      const venue =
        wcif?.schedule.venues?.find((v) =>
          v.rooms.some((r) =>
            r.activities.some(
              (a) => a.id === activity.id || a.childActivities?.some((ca) => ca.id === activity.id),
            ),
          ),
        ) || wcif?.schedule.venues?.[0];

      const dateTime = new Date(activity.startTime);

      return {
        approxDateTime: dateTime.getTime(),
        date: dateTime.toLocaleDateString(navigator.language, {
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
              (a) => a.id === activity.id || a.childActivities?.some((ca) => ca.id === activity.id),
            ),
          ),
        ) || wcif?.schedule.venues?.[0];

      const dateTime = new Date(activity.startTime);

      return {
        ...activity,
        date: dateTime.toLocaleDateString(navigator.language, {
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
    [activitiesWithParsedDate],
  );

  return (
    <Container>
      <div className="flex flex-col w-full px-1 py-2 type-body">
        <div className="p-2">
          <h3 className="-mb-2 type-subheading">{room?.name}</h3>
          <span className="type-meta">{venue?.name}</span>
        </div>

        {scheduleDays.map((day) => (
          <div key={day.date} className="flex flex-col">
            <p className="w-full mb-1 text-center bg-gray-50 dark:bg-gray-800 type-heading">
              {day.date}
            </p>
            <div className="flex flex-col">
              {getActivitiesByDate(day.date).map((activity) => {
                const stage = room && getRoomData(room, activity);
                return (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    timeZone={timeZone}
                    stage={stage}
                    showRoom={!!stage}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <hr className="my-2 border-t border-gray-200 dark:border-gray-700" />
        <div className="flex flex-row justify-between">
          <Link
            to={`/competitions/${wcif?.id}/rooms`}
            className="flex flex-row w-full p-2 px-1 my-1 transition-colors border rounded-md cursor-pointer group border-primary bg-primary hover:bg-primary-strong">
            {t('competition.room.back')}
          </Link>
        </div>
      </div>
    </Container>
  );
}
