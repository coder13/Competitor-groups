import type { Meta, StoryObj } from '@storybook/react';
import { AssignmentLabel } from './AssignmentLabel';

const meta = {
  title: 'Components/Competition/AssignmentLabel',
  component: AssignmentLabel,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof AssignmentLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Competitor: Story = {
  args: {
    assignmentCode: 'competitor',
  },
};

export const Judge: Story = {
  args: {
    assignmentCode: 'staff-judge',
  },
};
