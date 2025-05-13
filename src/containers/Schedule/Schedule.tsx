import { useCallback, useEffect, useMemo } from 'react';
import ActivityRow from '../../components/ActivitiyRow';
import { getRooms, getScheduledDays, getVenueForActivity } from '../../lib/activities';
import { Competition } from '@wca/helpers';
import { useCollapse } from '../../hooks/UseCollapse';
import { ActivityWithRoomOrParent } from '../../lib/types';

const key = (compId: string) => `${compId}-schedule`;

const ScheduleDay = ({
  wcif,
  date,
  activities,
  showRoom,
}: {
  wcif;
  date: string;
  activities: ActivityWithRoomOrParent[];
  showRoom: boolean;
}) => {
  const { collapsedDates, toggleDate } = useCollapse(key(wcif.id));

  const findVenue = useCallback(() => {
    return getVenueForActivity(wcif);
  }, [wcif]);

  const collapsed = collapsedDates.includes(date);
  const toggleCollapsed = useCallback(() => {
    toggleDate(date);
  }, [date, toggleDate]);

  return (
    <div className="flex flex-col">
      <div
        className="w-full text-center bg-slate-50 hover:bg-slate-100 font-bold text-lg mb-1 select-none cursor-pointer h-10 transition-colors duration-150"
        onClick={() => toggleCollapsed()}>
        <span>{date}</span>
        <span className="p-2 flex-end">{collapsed ? ' ▼' : ' ▲'}</span>
      </div>
      <div className="flex flex-col">
        {(collapsed ? [] : activities).map((activity) => {
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
  );
};

export interface ScheduleContainerProps {
  wcif: Competition;
}

export const ScheduleContainer = ({ wcif }: ScheduleContainerProps) => {
  const { collapsedDates, setCollapsedDates } = useCollapse(key(wcif.id));

  const scheduleDays = useMemo(() => getScheduledDays(wcif), [wcif]);

  useEffect(() => {
    const now = new Date().getTime();

    const collapse = new Set(collapsedDates);
    scheduleDays.forEach(({ date, activities }) => {
      const lastActivityEndTime = Math.max(...activities.map((i) => new Date(i.endTime).getTime()));

      // Collapse days that are more than 4 hours old.
      if (now - new Date(lastActivityEndTime).getTime() > 1000 * 60 * 60 * 4) {
        collapse.add(date);
      }
    });

    setCollapsedDates([...collapse]);
  }, [collapsedDates, scheduleDays, setCollapsedDates]);

  const showRoom = useMemo(() => wcif && getRooms(wcif).length > 1, [wcif]);

  return (
    <div>
      {scheduleDays.map(({ date, activities }) => (
        <ScheduleDay
          key={date}
          wcif={wcif}
          activities={activities}
          date={date}
          showRoom={showRoom}
        />
      ))}
    </div>
  );
};
