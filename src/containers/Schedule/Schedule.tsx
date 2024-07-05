import { useCallback, useMemo } from 'react';
import ActivityRow from '../../components/ActivitiyRow';
import { byDate } from '../../lib/utils';
import { getNumericDateFormatter } from '../../lib/time';
import {
  getActivitiesWithParsedDate,
  getAllActivities,
  getRooms,
  getScheduledDays,
  getVenueForActivity,
} from '../../lib/activities';
import { Competition } from '@wca/helpers';

export interface ScheduleContainerProps {
  wcif: Competition;
}

export const ScheduleContainer = ({ wcif }) => {
  const showRoom = useMemo(() => wcif && getRooms(wcif).length > 1, [wcif]);

  const activities = useMemo(
    () =>
      wcif
        ? getAllActivities(wcif)
            .sort(byDate)
            .filter((activity) => activity.childActivities.length === 0)
        : [],
    [wcif]
  );

  const scheduleDays = getScheduledDays(wcif);

  const activitiesWithParsedDate = useMemo(
    () => getActivitiesWithParsedDate(wcif)(activities),
    [activities]
  );

  const getActivitiesByDate = useCallback(
    (date) => activitiesWithParsedDate.filter((a) => a.date === date),
    [activitiesWithParsedDate]
  );

  const findVenue = useCallback(() => {
    return getVenueForActivity(wcif);
  }, [wcif]);

  return (
    <>
      {scheduleDays.map((day) => (
        <div key={day.date} className="flex flex-col">
          <p className="w-full text-center bg-slate-50 font-bold text-lg mb-1">{day.date}</p>
          <div className="flex flex-col">
            {getActivitiesByDate(day.date).map((activity) => {
              const venue = findVenue()(activity);
              const timeZone = venue?.timezone ?? wcif.schedule.venues?.[0]?.timezone ?? '';

              return (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  timeZone={timeZone}
                  room={activity?.parent?.parent?.room || activity?.parent?.room || activity?.room}
                  showRoom={showRoom}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
