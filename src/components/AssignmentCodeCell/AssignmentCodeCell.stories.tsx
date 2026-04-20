import type { Meta, StoryObj } from '@storybook/react';
import { AssignmentCodeCell } from './AssignmentCodeCell';

const meta = {
  title: 'Components/Competition/AssignmentCodeCell',
  component: AssignmentCodeCell,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl bg-panel p-4">
        <table className="w-full">
          <tbody>
            <tr>
              <Story />
            </tr>
          </tbody>
        </table>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AssignmentCodeCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Competitor: Story = {
  args: {
    assignmentCode: 'competitor',
  },
};

export const Verb: Story = {
  args: {
    assignmentCode: 'staff-judge',
    grammar: 'verb',
  },
};

export const Letter: Story = {
  args: {
    assignmentCode: 'staff-scrambler',
    letter: true,
  },
};

export const BorderedCount: Story = {
  args: {
    as: 'div',
    assignmentCode: 'staff-runner',
    border: true,
    count: 4,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl bg-panel p-4">
        <Story />
      </div>
    ),
  ],
};
