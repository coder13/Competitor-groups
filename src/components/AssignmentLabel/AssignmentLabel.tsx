import { AssignmentCode } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { Pill } from '../Pill';

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode;
}

export function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  const { t } = useTranslation();

  if (assignmentCode.match(/judge/i)) {
    return (
      <Pill className="bg-blue-200">
        {t('common.assignments.staff-judge.noun', {
          defaultValue: assignmentCode.replace('staff-', ''),
        })}
      </Pill>
    );
  }

  const name = t(`common.assignments.${assignmentCode}.noun`, {
    defaultValue: assignmentCode.replace('staff-', ''),
  });

  switch (assignmentCode) {
    case 'competitor':
      return <Pill className="bg-green-200">{name}</Pill>;
    case 'staff-scrambler':
      return <Pill className="bg-yellow-200">{name}</Pill>;
    case 'staff-runner':
      return <Pill className="bg-orange-200">{name}</Pill>;
    case 'staff-dataentry':
      return <Pill className="bg-cyan-200">{name}</Pill>;
    case 'staff-announcer':
      return <Pill className="bg-violet-200">{name}</Pill>;
    case 'staff-delegate':
      return <Pill className="bg-purple-200">{name}</Pill>;
    case 'staff-stagelead':
      return <Pill className="bg-purple-800">{name}</Pill>;
    default:
      return <Pill className="bg-blue-100">{name}</Pill>;
  }
}
