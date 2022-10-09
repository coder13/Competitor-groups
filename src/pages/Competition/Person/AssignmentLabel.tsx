import tw from 'tailwind-styled-components';

const Container = tw.span`
  px-[6px]
  py-[4px]
  rounded-md
  bg-blue-100
`;

export default function AssignmentLabel({ assignmentCode }) {
  switch (assignmentCode) {
    case 'competitor':
      return <Container className="bg-green-200">Competitor</Container>;
    case 'staff-scrambler':
      return <Container className="bg-yellow-200">Scrambler</Container>;
    case 'staff-judge':
      return <Container className="bg-blue-200">Judge</Container>;
    case 'staff-runner':
      return <Container className="bg-orange-200">Runner</Container>;
    default:
      return <Container>{assignmentCode}</Container>;
  }
}
