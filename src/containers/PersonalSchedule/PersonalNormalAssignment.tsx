import { Assignment } from '@wca/helpers';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { AssignmentLabel } from '@/components';
import { BaseAssignmentPill } from '@/components/Pill';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { ActivityWithRoomOrParent } from '@/lib/types';
import { roundTime } from '@/lib/utils';
import { formatBriefActivityName } from './utils';

export interface PersonalNormalAssignmentProps {
  competitionId: string;
  assignment: Assignment;
  activity: ActivityWithRoomOrParent;
  timeZone: string;
  room: {
    name: string;
    color: string;
  };
  isCurrent?: boolean;
  isOver?: boolean;
  showTopBorder: boolean;
  showBottomBorder: boolean;
  showRoom: boolean;
  showStationNumber: boolean;

  rowSpan?: number;
}

export const PersonalNormalAssignment = ({
  competitionId,
  assignment,
  activity,
  timeZone,
  isCurrent = false,
  isOver = false,
  room,
  showTopBorder,
  showBottomBorder,
  showRoom,
  showStationNumber,
  rowSpan = 1,
}: PersonalNormalAssignmentProps) => {
  const roundedStartTime = roundTime(new Date(activity?.startTime || 0), 5);

  const formattedStartTime = roundedStartTime.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });

  const { groupNumber } = parseActivityCodeFlexible(activity.activityCode);

  return (
    <Link
      key={`${assignment.activityId}-${assignment.assignmentCode}`}
      style={{
        ...(isCurrent && {
          backgroundColor: `${room.color}25`,
        }),
      }}
      className={classNames(
        'table-row text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-gray-700',
        {
          'opacity-40': isOver,
          'bg-op': isCurrent,
          'border-t border-gray-200 dark:border-gray-700': showTopBorder,
          'border-b border-gray-200 dark:border-gray-700': showBottomBorder,
        },
      )}
      to={`/competitions/${competitionId}/activities/${assignment.activityId}`}>
      {showTopBorder && (
        <td className="justify-center py-2 text-center" rowSpan={rowSpan + 1}>
          {formatBriefActivityName(activity)}
        </td>
      )}
      <td className="py-2 text-center min-w-[5em]">{formattedStartTime}</td>
      <td className="py-2 text-xs text-center sm:text-sm">
        <AssignmentLabel assignmentCode={assignment.assignmentCode} />
      </td>
      <td className="py-2 text-base text-center sm:text-lg">{groupNumber}</td>
      {showRoom && (
        <td className="py-2 text-xs text-center sm:text-sm" style={{}}>
          <BaseAssignmentPill
            className="min-w-[7em]"
            style={{
              backgroundColor: room.color ? `${room.color}70` : 'inherit',
            }}>
            {room.name}
          </BaseAssignmentPill>
        </td>
      )}
      {showStationNumber && <td className="py-2 text-center">{assignment.stationNumber}</td>}
    </Link>
  );
};
