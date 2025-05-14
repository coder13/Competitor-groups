import { AssignmentCode } from '@wca/helpers';
import { useTranslation } from 'react-i18next';

const Container = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <span className={`${className} px-[6px] py-[4px] rounded-md bg-blue-100`}>{children}</span>
);

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode;
}

export function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  const { t } = useTranslation();

  if (assignmentCode.match(/judge/i)) {
    return (
      <Container className="bg-blue-200">
        {t('common.assignments.staff-judge.noun', {
          defaultValue: assignmentCode.replace('staff-', ''),
        })}
      </Container>
    );
  }

  const name = t(`common.assignments.${assignmentCode}.noun`, {
    defaultValue: assignmentCode.replace('staff-', ''),
  });

  switch (assignmentCode) {
    case 'competitor':
      return <Container className="bg-green-200">{name}</Container>;
    case 'staff-scrambler':
      return <Container className="bg-yellow-200">{name}</Container>;
    case 'staff-runner':
      return <Container className="bg-orange-200">{name}</Container>;
    case 'staff-dataentry':
      return <Container className="bg-cyan-200">{name}</Container>;
    case 'staff-announcer':
      return <Container className="bg-violet-200">{name}</Container>;
    case 'staff-delegate':
      return <Container className="bg-purple-200">{name}</Container>;
    case 'staff-stagelead':
      return <Container className="bg-purple-800">{name}</Container>;
    default:
      return <Container>{name}</Container>;
  }
}
