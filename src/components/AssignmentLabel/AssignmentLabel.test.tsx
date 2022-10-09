import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignmentLabel from './AssignmentLabel';

describe('components/AssignmentLabel', () => {
  it('should render correctly when assignmentCode is "competitor"', () => {
    const { baseElement } = render(<AssignmentLabel assignmentCode="competitor" />);
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <span
            class="px-[6px] py-[4px] rounded-md bg-green-200"
          >
            Competitor
          </span>
        </div>
      </body>
    `);
  });

  it('should render correctly when assignmentCode is "staff-judge"', () => {
    const { baseElement } = render(<AssignmentLabel assignmentCode="staff-judge" />);
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <span
            class="px-[6px] py-[4px] rounded-md bg-blue-200"
          >
            Judge
          </span>
        </div>
      </body>
    `);
  });

  it('should render correctly when assignmentCode is "staff-runner"', () => {
    const { baseElement } = render(<AssignmentLabel assignmentCode="staff-runner" />);
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <span
            class="px-[6px] py-[4px] rounded-md bg-orange-200"
          >
            Runner
          </span>
        </div>
      </body>
    `);
  });

  it('should render correctly when assignmentCode is "staff-scrambler"', () => {
    const { baseElement } = render(<AssignmentLabel assignmentCode="staff-scrambler" />);
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <span
            class="px-[6px] py-[4px] rounded-md bg-yellow-200"
          >
            Scrambler
          </span>
        </div>
      </body>
    `);
  });

  it('should render correctly when assignmentCode is non-standard', () => {
    const { baseElement } = render(<AssignmentLabel assignmentCode="staff-dataentry" />);
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <span
            class="px-[6px] py-[4px] rounded-md bg-blue-100"
          >
            staff-dataentry
          </span>
        </div>
      </body>
    `);
  });
});
