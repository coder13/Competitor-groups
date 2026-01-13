import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssignmentsMap, SupportedAssignmentCode } from '@/lib/assignments';
import { getAssignmentColorClasses } from '@/lib/colors';

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

  const colorClasses = assignmentCode ? getAssignmentColorClasses(assignmentCode) : null;

  return (
    <Component
      className={classNames(
        className,
        colorClasses && !border && colorClasses.bgMuted,
        colorClasses && border && [colorClasses.border, 'border-b-4'],
      )}
      {...props}>
      {content}
      {count ? (
        <>
          {' '}
          <span className="type-body-sm">({count})</span>
        </>
      ) : null}
    </Component>
  );
}
