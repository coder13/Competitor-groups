import { AssignmentCode } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { BaseAssignmentPill } from '../Pill';

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode;
}

export function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  const { t } = useTranslation();

  if (assignmentCode.match(/judge/i)) {
    return (
      <BaseAssignmentPill className="bg-primary">
        {t('common.assignments.staff-judge.noun', {
          defaultValue: assignmentCode.replace('staff-', ''),
        })}
      </BaseAssignmentPill>
    );
  }

  const name = t(`common.assignments.${assignmentCode}.noun`, {
    defaultValue: assignmentCode.replace('staff-', ''),
  });

  switch (assignmentCode) {
    case 'competitor':
      return (
        <BaseAssignmentPill className="bg-green-200 dark:bg-green-900">{name}</BaseAssignmentPill>
      );
    case 'staff-scrambler':
      return (
        <BaseAssignmentPill className="bg-yellow-200 dark:bg-yellow-900">{name}</BaseAssignmentPill>
      );
    case 'staff-runner':
      return (
        <BaseAssignmentPill className="bg-orange-200 dark:bg-orange-900">{name}</BaseAssignmentPill>
      );
    case 'staff-dataentry':
      return (
        <BaseAssignmentPill className="bg-cyan-200 dark:bg-cyan-900">{name}</BaseAssignmentPill>
      );
    case 'staff-announcer':
      return (
        <BaseAssignmentPill className="bg-violet-200 dark:bg-violet-900">{name}</BaseAssignmentPill>
      );
    case 'staff-delegate':
      return (
        <BaseAssignmentPill className="bg-purple-200 dark:bg-purple-900">{name}</BaseAssignmentPill>
      );
    case 'staff-stagelead':
      return (
        <BaseAssignmentPill className="bg-fuchsia-200 dark:bg-fuchsia-900">
          {name}
        </BaseAssignmentPill>
      );
    case 'staff-stream':
      return (
        <BaseAssignmentPill className="bg-pink-300 dark:bg-pink-900">{name}</BaseAssignmentPill>
      );
    case 'staff-photo':
      return (
        <BaseAssignmentPill className="bg-amber-500 dark:bg-amber-900">{name}</BaseAssignmentPill>
      );
    default:
      return <BaseAssignmentPill className="bg-primary">{name}</BaseAssignmentPill>;
  }
}
