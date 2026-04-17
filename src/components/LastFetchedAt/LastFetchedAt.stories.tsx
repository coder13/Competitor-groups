import type { Meta, StoryObj } from '@storybook/react';
import { LastFetchedAt } from './LastFetchedAt';

const meta = {
  title: 'Components/App/LastFetchedAt',
  component: LastFetchedAt,
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LastFetchedAt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JustNow: Story = {
  args: {
    lastFetchedAt: new Date(Date.now() - 30 * 1000),
  },
};

export const EarlierToday: Story = {
  args: {
    lastFetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
};
