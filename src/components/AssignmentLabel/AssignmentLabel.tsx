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
      <Pill className="bg-sky-300">
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
      return <Pill className="bg-green-300">{name}</Pill>;
    case 'staff-scrambler':
      return <Pill className="bg-amber-300">{name}</Pill>;
    case 'staff-runner':
      return <Pill className="bg-orange-300">{name}</Pill>;
    case 'staff-dataentry':
      return <Pill className="bg-lime-300">{name}</Pill>;
    case 'staff-announcer':
      return <Pill className="bg-red-300">{name}</Pill>;
    case 'staff-delegate':
      return <Pill className="bg-indigo-300">{name}</Pill>;
    case 'staff-stagelead':
      return <Pill className="bg-pink-300">{name}</Pill>;
    default:
      return <Pill className="bg-neutral-100">{name}</Pill>;
  }
}
