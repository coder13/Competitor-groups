import { AssignmentCode } from '@wca/helpers';
import tw from 'tailwind-styled-components';

const Container = tw.span`
  px-[6px]
  py-[4px]
  rounded-md
  bg-blue-100
`;

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

  switch (assignmentCode) {
    case 'competitor':
      return <Container className="bg-green-200">Competitor</Container>;
    case 'staff-scrambler':
      return <Container className="bg-yellow-200">Scrambler</Container>;
    case 'staff-runner':
      return <Container className="bg-orange-200">Runner</Container>;
    case 'staff-dataentry':
      return <Container className="bg-cyan-200">Data Entry</Container>;
    case 'staff-announcer':
      return <Container className="bg-violet-200">Announcer</Container>;
    case 'staff-delegate':
      return <Container className="bg-purple-200">Delegate</Container>;
    case 'staff-stage-lead':
      return <Container className="bg-purple-800">Stage Lead</Container>;
    default:
      return <Container>{assignmentCode.replace('staff-', '')}</Container>;
  }
}
