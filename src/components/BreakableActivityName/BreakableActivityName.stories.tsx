import type { Meta, StoryObj } from '@storybook/react';
import { BreakableActivityName } from './BreakableActivityName';

const meta = {
  title: 'Components/Competition/BreakableActivityName',
  component: BreakableActivityName,
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof BreakableActivityName>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StandardRound: Story = {
  args: {
    activityCode: '333-r2-g1',
  },
};

export const OtherActivity: Story = {
  args: {
    activityCode: 'other-lunch',
    activityName: 'Lunch Break',
  },
};
