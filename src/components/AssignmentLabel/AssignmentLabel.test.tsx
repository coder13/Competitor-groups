import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AssignmentLabel } from './AssignmentLabel';

describe('components/AssignmentLabel', () => {
  const testCases = [
    { assignmentCode: 'competitor' },
    { assignmentCode: 'staff-judge' },
    { assignmentCode: 'staff-runner' },
    { assignmentCode: 'staff-scrambler' },
    { assignmentCode: 'staff-dataentry' },
    { assignmentCode: 'staff-announcer' },
    { assignmentCode: 'staff-delegate' },
    { assignmentCode: 'staff-stagelead' },
    { assignmentCode: 'staff-other' },
  ];

  testCases.forEach(({ assignmentCode }) => {
    it(`should render correctly when assignmentCode is "${assignmentCode}"`, () => {
      const { baseElement } = render(<AssignmentLabel assignmentCode={assignmentCode} />);
      expect(baseElement).toMatchSnapshot();
    });
  });
});
