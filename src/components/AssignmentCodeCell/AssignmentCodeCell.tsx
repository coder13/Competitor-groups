import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

    const translationKey = `common.assignments.${assignmentCode}`;
    if (grammar === 'plural-noun') {
      return t(`${translationKey}.noun_other`);
    }

    if (grammar === 'verb') {
      return t(`${translationKey}.verb`);
    }

    return t(`${translationKey}.noun`);
  }, [assignment, assignmentCode, children, grammar, letter, t]);

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
