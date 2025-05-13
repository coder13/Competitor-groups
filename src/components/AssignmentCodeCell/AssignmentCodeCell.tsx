import { useMemo } from 'react';
import { AssignmentsMap, SupportedAssignmentCode } from '@/lib/assignments';

interface AssignmentCodeCellProps<T extends React.ElementType> {
  children?: React.ReactNode;
  className?: string;
  assignmentCode?: SupportedAssignmentCode | string;
  letter?: boolean;
  as?: T;
  border?: boolean;
  grammar?: 'verb' | 'noun' | 'plural-noun';
  count?: number;
}

export function AssignmentCodeCell<T extends React.ElementType = 'td'>({
  children,
  className,
  assignmentCode,
  letter = false,
  as,
  border = false,
  grammar = 'noun',
  count,
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
      return letter ? assignmentCode[0] : assignmentCode.split('-')[1];
    }
    if (letter) {
      return assignment.letter;
    }

    if (grammar === 'plural-noun') {
      return assignment.plural;
    }

    if (grammar === 'verb') {
      return assignment.verb;
    }

    return assignment.name;
  }, [assignment, assignmentCode, children, grammar, letter]);

  const Component = as || 'td';

  const twColor = assignment?.color;
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
              borderBottomWidth: 4,
            }),
      }}
      className={className}
      {...props}>
      {content}
      {count ? (
        <>
          {' '}
          <span className="text-sm">({count})</span>
        </>
      ) : null}
    </Component>
  );
}
