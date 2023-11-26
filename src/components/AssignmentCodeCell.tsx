import { useMemo } from 'react';
import { AssignmentsMap, SupportedAssignmentCode } from '../lib/assignments';
import classNames from 'classnames';

interface AssignmentCodeCellProps<T extends React.ElementType> {
  children?: React.ReactNode;
  className?: string;
  assignmentCode?: SupportedAssignmentCode | string;
  letter?: boolean;
  as?: T;
  border?: boolean;
}

export function AssignmentCodeCell<T extends React.ElementType = 'td'>({
  children,
  className,
  assignmentCode,
  letter = false,
  as,
  border = false,
  ...props
}: AssignmentCodeCellProps<T> & React.ComponentProps<T>) {
  const assignment = assignmentCode && AssignmentsMap[assignmentCode];

  const content = useMemo(() => {
    if (!assignmentCode) {
      return '';
    }

    if (children) {
      return children;
    }

    if (!assignment) {
      return letter ? assignmentCode[0] : assignmentCode;
    }

    return letter ? assignment.letter : assignment.name;
  }, [assignmentCode]);

  const Component = as || 'td';

  const twColor = assignment?.color;
  console.log(assignment?.colorClass);
  const twBorderColor = assignment?.colorClass?.[300];

  return (
    <Component
      style={{
        ...(!border
          ? {
              backgroundColor: twColor ? `${twColor}4f` : undefined,
            }
          : {
              borderColor: twBorderColor,
              borderBottomWidth: 2,
            }),
      }}
      className={className}
      {...props}>
      {content}
    </Component>
  );
}
