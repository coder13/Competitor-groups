import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityRow, Container } from '@/components';
import { getAllChildActivities, getRoomData } from '@/lib/activities';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { formatToParts } from '@/lib/time';
import { byDate } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionRoomContainerProps {
  competitionId: string;
  roomId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionRoomContainer({
  competitionId,
  roomId,
  LinkComponent = AnchorLink,
}: CompetitionRoomContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  const venue = useMemo(
    () =>
      wcif?.schedule?.venues?.find((venueCandidate) =>
        venueCandidate.rooms.some((room) => room.id.toString() === roomId),
      ),
    [roomId, wcif?.schedule?.venues],
  );

  const room = useMemo(
    () => venue?.rooms?.find((roomCandidate) => roomCandidate.id.toString() === roomId),
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
      const activityVenue =
        wcif?.schedule.venues?.find((venueCandidate) =>
          venueCandidate.rooms.some((roomCandidate) =>
            roomCandidate.activities.some(
              (roomActivity) =>
                roomActivity.id === activity.id ||
                roomActivity.childActivities?.some(
                  (childActivity) => childActivity.id === activity.id,
                ),
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
          timeZone: activityVenue?.timezone,
        }),
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((value, index, array) => array.findIndex(({ date }) => date === value.date) === index)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  const activitiesWithParsedDate = activities
    .map((activity) => {
      const activityVenue =
        wcif?.schedule.venues?.find((venueCandidate) =>
          venueCandidate.rooms.some((roomCandidate) =>
            roomCandidate.activities.some(
              (roomActivity) =>
                roomActivity.id === activity.id ||
                roomActivity.childActivities?.some(
                  (childActivity) => childActivity.id === activity.id,
                ),
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
          timeZone: activityVenue?.timezone,
        }),
      };
    })
    .sort((a, b) => byDate(a, b));

  const getActivitiesByDate = useCallback(
    (date: string) => activitiesWithParsedDate.filter((activity) => activity.date === date),
    [activitiesWithParsedDate],
  );

  return (
    <Container>
      <div className="flex w-full flex-col px-1 py-2 type-body">
        <div className="p-2">
          <h3 className="-mb-2 type-subheading">{room?.name}</h3>
          <span className="type-meta">{venue?.name}</span>
        </div>

        {scheduleDays.map((day) => (
          <div key={day.date} className="flex flex-col">
            <p className="type-heading mb-1 w-full bg-gray-50 text-center dark:bg-gray-800">
              {day.date}
            </p>
            <div className="flex flex-col">
              {getActivitiesByDate(day.date).map((activity) => {
                const stage = room && getRoomData(room, activity);
                return (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    competitionId={competitionId}
                    LinkComponent={LinkComponent}
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
          <LinkComponent
            to={`/competitions/${competitionId}/rooms`}
            className="group my-1 flex w-full cursor-pointer flex-row rounded-md border border-primary bg-primary p-2 px-1 transition-colors hover:bg-primary-strong">
            {t('competition.room.back')}
          </LinkComponent>
        </div>
      </div>
    </Container>
  );
}
