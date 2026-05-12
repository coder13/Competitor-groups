import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { RoomPill } from '@/components/Pill';
import { useNow } from '@/hooks/useNow';
import { LinkRenderer } from '@/lib/linkRenderer';
import { formatTimeRange } from '@/lib/time';
import { ScheduleActivityGroup } from './scheduleActivityGroups';

interface ScheduleActivityRowProps {
  group: ScheduleActivityGroup;
  LinkComponent?: LinkRenderer;
  showRoom?: boolean;
}

export function ScheduleActivityRow({
  group,
  LinkComponent = Link,
  showRoom = true,
}: ScheduleActivityRowProps) {
  const now = useNow();
  const isOver = new Date(group.endTime).getTime() < now.getTime();

  return (
    <LinkComponent
      className={classNames(
        'flex w-full flex-col p-2 text-left type-body even:table-bg-row-alt hover:table-bg-row-hover',
        {
          'opacity-50': isOver,
        },
      )}
      to={group.to}>
      <span className="type-body">{group.name}</span>
      <span className="flex items-start justify-between gap-4 type-meta">
        {showRoom && (
          <span className="flex min-w-0 flex-wrap gap-2">
            {group.rooms.map((room) => (
              <RoomPill
                key={room.id}
                className="px-1"
                style={{
                  backgroundColor: `${room.color}70`,
                }}>
                {room.name}
              </RoomPill>
            ))}
          </span>
        )}
        <span className="ml-auto shrink-0 whitespace-nowrap text-right">
          {formatTimeRange(group.startTime, group.endTime, 5, group.timeZone)}
        </span>
      </span>
    </LinkComponent>
  );
}
