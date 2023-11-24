import { useMemo } from 'react';
import { AssignmentsMap, SupportedAssignmentCode } from '../lib/assignments';
import classNames from 'classnames';

interface AssignmentCodeCellProps<T extends React.ElementType> {
  children?: React.ReactNode;
  className?: string;
  assignmentCode?: SupportedAssignmentCode | string;
  letter?: boolean;
  as?: T;
}

export function AssignmentCodeCell<T extends React.ElementType = 'td'>({
  children,
  className,
  assignmentCode,
  letter = false,
  as,
  ...props
}: AssignmentCodeCellProps<T> & React.ComponentProps<T>) {
  const content = useMemo(() => {
    if (!assignmentCode) {
      return '';
    }

    if (children) {
      return children;
    }

    const assignment = AssignmentsMap[assignmentCode];

    if (!assignment) {
      return letter ? assignmentCode[0] : assignmentCode;
    }

    return letter ? assignment.letter : assignment.name;
  }, [assignmentCode]);

  const Component = as || 'td';

  return (
    <Component
      className={classNames(
        {
          'bg-green-200': assignmentCode === 'competitor',
          'bg-yellow-200': assignmentCode === 'staff-scrambler',
          'bg-blue-200': assignmentCode === 'staff-judge',
          'bg-red-200': assignmentCode === 'staff-runner',
          'bg-purple-200': assignmentCode === 'staff-delegate',
          'bg-indigo-200': assignmentCode === 'staff-stagelead',
          'bg-pink-200': assignmentCode === 'staff-announcer',
          'bg-grey-200':
            assignmentCode === 'staff-dataentry' ||
            assignmentCode === 'staff-other',
        },
        className
      )}
      {...props}>
      {content}
    </Component>
  );
}
