import classNames from 'classnames';
import { BaseAssignmentPill } from '@/components/Pill';
import { worldsAssignmentMap } from './constants';

export interface ExtraAssignmentProps {
  assignment: {
    assignmentCode: string;
  };
  isOver: boolean;
  isCurrent: boolean;
  startTime: Date;
  endTime: Date;
  room?: {
    name: string;
    color: string;
  };
  timeZone?: string;
}

export const ExtraAssignment = ({
  assignment,
  isOver,
  isCurrent,
  startTime,
  endTime,
  room,
  timeZone,
}: ExtraAssignmentProps) => {
  const formattedStartTime = startTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
  const formattedEndTime = endTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });

  return (
    <tr
      className={classNames(
        'table-row type-body-sm sm:type-body-sm hover:bg-slate-100 dark:hover:bg-gray-700 border-y border-tertiary-weak',
        {
          'opacity-40': isOver,
          'bg-op': isCurrent,
        },
      )}>
      <td colSpan={2} className="py-2 text-center">
        {formattedStartTime} - {formattedEndTime}
      </td>
      <td colSpan={1} className="py-2 text-center">
        {worldsAssignmentMap[assignment.assignmentCode] || assignment.assignmentCode}
      </td>
      <td></td>
      {room ? (
        <td className="py-2 type-body-sm text-center sm:type-body-sm" style={{}}>
          <BaseAssignmentPill
            className="min-w-[7em]"
            style={{
              backgroundColor: room.color ? `${room.color}70` : 'inherit',
            }}>
            {room.name}
          </BaseAssignmentPill>
        </td>
      ) : (
        <td />
      )}
    </tr>
  );
};
