import { Activity, Room, Venue } from '@wca/helpers';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stage } from '@/extensions/org.cubingusa.natshelper.v1/types';
import { useNow } from '@/hooks/useNow';
import { activityCodeToName } from '@/lib/activityCodes';
import { formatTimeRange } from '@/lib/time';
import { Pill } from '../Pill';

interface ActivityRowProps {
  activity: Activity;
  stage?: Pick<Stage | Room, 'name' | 'color'>;
  timeZone: Venue['timezone'];
  showRoom?: boolean;
}

export function ActivityRow({ activity, stage, timeZone, showRoom = true }: ActivityRowProps) {
  const { competitionId } = useParams();
  const now = useNow();

  const isOver = useMemo(
    () => new Date(activity.endTime).getTime() < now.getTime(),
    [activity.endTime, now],
  );
  const activityName = activity.activityCode.startsWith('other')
    ? activity.name
    : activityCodeToName(activity.activityCode);

  return (
    <Link
      key={activity.id}
      className={classNames(
        'flex flex-col w-full p-2 text-gray-900 dark:text-white even:bg-slate-50 even:dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 even:hover:bg-slate-200 even:dark:hover:bg-gray-600',
        {
          'opacity-50': isOver,
        },
      )}
      to={`/competitions/${competitionId}/activities/${activity.id}`}>
      <span>{activityName}</span>
      <span className="text-xs md:text-sm font-light flex justify-between">
        {showRoom && stage && (
          <Pill
            className="mr-2 px-1 rounded"
            style={{
              backgroundColor: `${stage.color}70`,
            }}>
            {stage.name}
          </Pill>
        )}
        <span>{formatTimeRange(activity.startTime, activity.endTime, 5, timeZone)}</span>
      </span>
    </Link>
  );
}
