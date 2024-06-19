import { AssignmentCode } from '@wca/helpers';
import Assignments from '../../lib/assignments';

const Container = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <span className={`${className} px-[6px] py-[4px] rounded-md bg-blue-100`}>{children}</span>
);

interface AssignmentLabelProps {
  assignmentCode: AssignmentCode;
}

export default function AssignmentLabel({ assignmentCode }: AssignmentLabelProps) {
  if (assignmentCode.match(/judge/i)) {
    return (
      <Container className="bg-blue-200">
        {assignmentCode === 'staff-judge' ? 'Judge' : assignmentCode.replace('staff-', '')}
      </Container>
    );
  }

  const config = Assignments.find((a) => a.id === assignmentCode);

  switch (assignmentCode) {
    case 'competitor':
      return <Container className="bg-green-200">{config?.name}</Container>;
    case 'staff-scrambler':
      return <Container className="bg-yellow-200">{config?.name}</Container>;
    case 'staff-runner':
      return <Container className="bg-orange-200">{config?.name}</Container>;
    case 'staff-dataentry':
      return <Container className="bg-cyan-200">{config?.name}</Container>;
    case 'staff-announcer':
      return <Container className="bg-violet-200">{config?.name}</Container>;
    case 'staff-delegate':
      return <Container className="bg-purple-200">{config?.name}</Container>;
    case 'staff-stagelead':
      return <Container className="bg-purple-800">{config?.name}</Container>;
    default:
      return <Container>{config ? config.name : assignmentCode.replace('staff-', '')}</Container>;
  }
}
