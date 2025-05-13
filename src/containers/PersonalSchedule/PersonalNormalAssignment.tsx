import { Assignment } from '@wca/helpers';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { ActivityWithRoomOrParent } from '../../lib/types';
import { parseActivityCodeFlexible } from '../../lib/activityCodes';
import { formatBriefActivityName } from './utils';
import { roundTime } from '../../lib/utils';
import AssignmentLabel from '../../components/AssignmentLabel/AssignmentLabel';

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

  const formattedStartTime = roundedStartTime.toLocaleTimeString([], {
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
      className={classNames('table-row text-xs sm:text-sm hover:bg-slate-100', {
        'opacity-40': isOver,
        'bg-op': isCurrent,
        'border-t': showTopBorder,
        'border-b': showBottomBorder,
      })}
      to={`/competitions/${competitionId}/activities/${assignment.activityId}`}>
      {showTopBorder && (
        <td className="py-2 text-center justify-center" rowSpan={rowSpan + 1}>
          {formatBriefActivityName(activity)}
        </td>
      )}
      <td className="py-2 text-center">{formattedStartTime}</td>
      <td className="py-2 text-center">
        <AssignmentLabel assignmentCode={assignment.assignmentCode} />
      </td>
      <td className="py-2 text-center text-base sm:text-lg">{groupNumber}</td>
      {showRoom && (
        <td
          className="py-2 text-center"
          style={{
            lineHeight: 2,
          }}>
          <span
            className="px-[6px]  py-[4px]  rounded-md"
            style={{
              backgroundColor: room.color ? `${room.color}70` : 'inherit',
            }}>
            {room.name}
          </span>
        </td>
      )}
      {showStationNumber && <td className="py-2 text-center">{assignment.stationNumber}</td>}
    </Link>
  );
};
