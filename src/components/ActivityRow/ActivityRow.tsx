import { Activity, Room, Venue } from '@wca/helpers';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Stage } from '@/extensions/org.cubingusa.natshelper.v1/types';
import { useNow } from '@/hooks/useNow';
import { activityCodeToName } from '@/lib/activityCodes';
import { formatTimeRange } from '@/lib/time';
import { RoomPill } from '../Pill';

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
        'flex flex-col w-full p-2 type-body even:table-bg-row-alt hover:table-bg-row-hover',
        {
          'opacity-50': isOver,
        },
      )}
      to={`/competitions/${competitionId}/activities/${activity.id}`}>
      <span className="type-body">{activityName}</span>
      <span className="flex justify-between type-meta">
        {showRoom && stage && (
          <RoomPill
            className="px-1 mr-2 rounded"
            style={{
              backgroundColor: `${stage.color}70`,
            }}>
            {stage.name}
          </RoomPill>
        )}
        <span>{formatTimeRange(activity.startTime, activity.endTime, 5, timeZone)}</span>
      </span>
    </Link>
  );
}
