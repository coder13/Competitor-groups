import { Link, useParams } from 'react-router-dom';
import { Activity, Room, Venue, activityCodeToName } from '@wca/helpers';
import { formatTimeRange } from '../lib/time';
import classNames from 'classnames';
import { useNow } from '../hooks/useNow';
import { useMemo } from 'react';

interface ActivityRowProps {
  activity: Activity;
  room?: Room;
  timeZone: Venue['timezone'];
  showRoom?: boolean;
}

export default function ActivityRow({
  activity,
  room,
  timeZone,
  showRoom = true,
}: ActivityRowProps) {
  const { competitionId } = useParams();
  const now = useNow();

  const isOver = useMemo(
    () => new Date(activity.endTime).getTime() < now.getTime(),
    [activity.endTime, now]
  );
  const activityName = activity.activityCode.startsWith('other')
    ? activity.name
    : activityCodeToName(activity.activityCode);

  return (
    <Link
      key={activity.id}
      className={classNames(
        'flex flex-col w-full p-2 even:bg-slate-50 hover:bg-slate-100 even:hover:bg-slate-200',
        {
          'opacity-50': isOver,
        }
      )}
      to={`/competitions/${competitionId}/activities/${activity.id}`}>
      <span>{activityName}</span>
      <span className="text-xs md:text-sm font-light flex justify-between">
        {showRoom && (
          <span
            className="mr-2 px-1 rounded"
            style={{
              backgroundColor: `${room?.color}70`,
            }}>
            {room?.name}
          </span>
        )}
        <span>{formatTimeRange(activity.startTime, activity.endTime, 5, timeZone)}</span>
      </span>
    </Link>
  );
}
