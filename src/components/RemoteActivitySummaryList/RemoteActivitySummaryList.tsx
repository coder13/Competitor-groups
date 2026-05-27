import { RoomPill } from '@/components/Pill';
import { getRoomData } from '@/lib/activities';
import { RemoteScheduledActivity } from '@/lib/notifyCompRemoteActivities';
import { formatTimeRange } from '@/lib/time';

interface RemoteActivitySummaryListProps {
  activities: RemoteScheduledActivity[];
  roundingMinutes?: number;
}

const activityTimeZone = (activity: RemoteScheduledActivity) =>
  (activity.room as RemoteScheduledActivity['room'] & { venue?: { timezone?: string } }).venue
    ?.timezone;

export function RemoteActivitySummaryList({
  activities,
  roundingMinutes = 5,
}: RemoteActivitySummaryListProps) {
  return (
    <ul className="divide-y divide-tertiary-weak">
      {activities.map((activity) => {
        const stage = getRoomData(activity.room, activity);

        return (
          <li key={activity.id} className="flex flex-col py-2 type-body">
            <span className="type-body-sm font-medium">{activity.name}</span>
            <span className="flex items-start justify-between gap-4 type-meta">
              <RoomPill
                className="px-1"
                style={{
                  backgroundColor: `${stage.color}70`,
                }}>
                {stage.name}
              </RoomPill>
              <span className="ml-auto shrink-0 whitespace-nowrap text-right">
                {formatTimeRange(
                  activity.startTime,
                  activity.endTime,
                  roundingMinutes,
                  activityTimeZone(activity),
                )}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
