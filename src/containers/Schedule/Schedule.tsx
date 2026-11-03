import { Competition } from '@wca/helpers';
import { useId, useMemo } from 'react';
import { useCollapse } from '@/hooks/UseCollapse';
import { getScheduledDays, hasMultipleScheduleLocations } from '@/lib/activities';
import { LinkRenderer } from '@/lib/linkRenderer';
import { ActivityWithRoomOrParent } from '@/lib/types';
import { ScheduleActivityRow } from './ScheduleActivityRow';
import { getScheduleActivityGroups } from './scheduleActivityGroups';

const key = (compId: string) => `${compId}-schedule`;

const ScheduleDay = ({
  wcif,
  date,
  activities,
  showRoom,
  collapsed,
  onToggle,
  LinkComponent,
}: {
  wcif: Competition;
  date: string;
  activities: ActivityWithRoomOrParent[];
  showRoom: boolean;
  collapsed: boolean;
  onToggle: () => void;
  LinkComponent?: LinkRenderer;
}) => {
  const activityGroups = useMemo(
    () => getScheduleActivityGroups(wcif, activities),
    [activities, wcif],
  );

  const activitiesId = useId();

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={!collapsed}
        aria-controls={activitiesId}
        className="w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-default font-bold type-heading mb-2 select-none cursor-pointer h-10 hover-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        onClick={onToggle}>
        <span>{date}</span>
        <span className="p-2 flex-end" aria-hidden="true">
          {collapsed ? ' ▼' : ' ▲'}
        </span>
      </button>
      <div id={activitiesId} className="flex flex-col" hidden={collapsed}>
        {(collapsed ? [] : activityGroups).map((group) => (
          <ScheduleActivityRow
            key={group.id}
            group={group}
            LinkComponent={LinkComponent}
            showRoom={showRoom}
          />
        ))}
      </div>
    </div>
  );
};

export interface ScheduleContainerProps {
  wcif: Competition;
  LinkComponent?: LinkRenderer;
}

// A competition owns one collapse state for all its days. Remount it on navigation
// so a different competition cannot inherit the previous competition's dates.
export const ScheduleContainer = (props: ScheduleContainerProps) => (
  <CompetitionSchedule key={props.wcif.id} {...props} />
);

const CompetitionSchedule = ({ wcif, LinkComponent }: ScheduleContainerProps) => {
  const scheduleDays = useMemo(() => getScheduledDays(wcif), [wcif]);

  const { collapsedDates, toggleDate } = useCollapse(key(wcif.id), () => {
    const now = Date.now();

    return scheduleDays
      .filter(({ activities }) => {
        const lastActivityEndTime = Math.max(
          ...activities.map((i) => new Date(i.endTime).getTime()),
        );
        // Collapse days that are more than 4 hours old.
        return now - lastActivityEndTime > 1000 * 60 * 60 * 4;
      })
      .map(({ date }) => date);
  });

  const showRoom = useMemo(() => hasMultipleScheduleLocations(wcif), [wcif]);

  return (
    <div>
      {scheduleDays.map(({ date, activities }) => (
        <ScheduleDay
          key={date}
          wcif={wcif}
          activities={activities}
          date={date}
          collapsed={collapsedDates.includes(date)}
          onToggle={() => toggleDate(date)}
          showRoom={showRoom}
          LinkComponent={LinkComponent}
        />
      ))}
    </div>
  );
};
