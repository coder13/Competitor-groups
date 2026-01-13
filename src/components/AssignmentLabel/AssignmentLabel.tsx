import { AssignmentCode } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { getAssignmentColorClasses } from '@/lib/colors';
import { BaseAssignmentPill } from '../Pill';

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode;
}

export function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  const { t } = useTranslation();

  const name = t(`common.assignments.${assignmentCode}.noun`, {
    defaultValue: assignmentCode.replace('staff-', ''),
  });

  const colorClasses = getAssignmentColorClasses(assignmentCode);

  return <BaseAssignmentPill className={colorClasses.bg}>{name}</BaseAssignmentPill>;
}
