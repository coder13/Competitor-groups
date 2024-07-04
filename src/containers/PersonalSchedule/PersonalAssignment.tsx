import classNames from 'classnames';
import { worldsAssignmentMap } from './constants';

export interface ExtraAssignmentProps {
  assignment: {
    assignmentCode: string;
  };
  isOver: boolean;
  isCurrent: boolean;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
}

export const ExtraAssignment = ({
  assignment,
  isOver,
  isCurrent,
  startTime,
  endTime,
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
      className={classNames('table-row text-xs sm:text-sm hover:bg-slate-100 border-y', {
        'opacity-40': isOver,
        'bg-op': isCurrent,
      })}>
      <td colSpan={2} className="py-2 text-center">
        {formattedStartTime} - {formattedEndTime}
      </td>
      <td colSpan={1} className="py-2 text-center">
        {worldsAssignmentMap[assignment.assignmentCode] || assignment.assignmentCode}
      </td>
      <td></td>
      <td></td>
    </tr>
  );
};
