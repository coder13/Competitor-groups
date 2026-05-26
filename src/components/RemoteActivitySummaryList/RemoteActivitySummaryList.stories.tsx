import type { Meta, StoryObj } from '@storybook/react';
import { RemoteScheduledActivity } from '@/lib/notifyCompRemoteActivities';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { RemoteActivitySummaryList } from './RemoteActivitySummaryList';

const venue = storybookCompetitionFixture.schedule.venues[0];
const mainRoom = venue.rooms[0];
const sideRoom = venue.rooms[1];

const scheduledActivity = (
  room: typeof mainRoom,
  parentIndex: number,
  childIndex: number,
): RemoteScheduledActivity => {
  const parent = room.activities[parentIndex];
  const child = parent.childActivities[childIndex] || parent;

  return {
    ...child,
    parent,
    room: {
      ...room,
      venue: {
        timezone: venue.timezone,
      },
    },
  } as RemoteScheduledActivity;
};

const meta = {
  title: 'Components/Competition/Remote Activity Summary List',
  component: RemoteActivitySummaryList,
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg bg-panel p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RemoteActivitySummaryList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SingleStage: Story = {
  args: {
    activities: [scheduledActivity(mainRoom, 0, 0)],
  },
};

export const MultipleStages: Story = {
  args: {
    activities: [scheduledActivity(mainRoom, 0, 0), scheduledActivity(sideRoom, 0, 0)],
  },
};
