import { Link, useParams } from 'react-router-dom';
import { Activity, Room, Venue } from '@wca/helpers';
import { formatTimeRange } from '../lib/time';
import classNames from 'classnames';

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

  const isOver = new Date(activity.endTime).getTime() < Date.now();

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
      <span>{activity.name}</span>
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
