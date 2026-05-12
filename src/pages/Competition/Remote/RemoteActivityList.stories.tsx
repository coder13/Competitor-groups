import type { Meta, StoryObj } from '@storybook/react';
import { RemoteActivityGroup, RemoteScheduledActivity } from '@/lib/notifyCompRemoteActivities';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { RemoteGroupList } from './RemoteActivityList';

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

const group = (
  id: string,
  status: RemoteActivityGroup['status'],
  activities: RemoteScheduledActivity[],
): RemoteActivityGroup => ({
  id,
  name: activities[0]?.name || id,
  scheduledActivities: activities,
  liveActivities: activities.map((activity) => ({
    activityId: activity.id,
    startTime:
      status === 'current' || status === 'mixed' || status === 'done' ? activity.startTime : null,
    endTime: status === 'done' ? activity.endTime : null,
  })),
  status,
});

const currentGroup = group('333-r1-g1', 'current', [
  scheduledActivity(mainRoom, 0, 0),
  scheduledActivity(sideRoom, 0, 0),
]);
const nextGroup = group('333-r1-g2', 'next', [
  scheduledActivity(mainRoom, 0, 1),
  scheduledActivity(sideRoom, 0, 1),
]);
const doneGroup = group('222-r1-g1', 'done', [scheduledActivity(mainRoom, 3, 0)]);

const meta = {
  title: 'Pages/Competition/Remote/Activity List',
  component: RemoteGroupList,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl bg-panel p-4 text-default">
        <Story />
      </div>
    ),
  ],
  args: {
    disabled: false,
    onSelectGroup: () => {},
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RemoteGroupList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MixedStates: Story = {
  args: {
    groups: [currentGroup, nextGroup, doneGroup],
  },
};

export const NoUpcomingActivities: Story = {
  args: {
    groups: [doneGroup],
  },
};

export const Saving: Story = {
  args: {
    disabled: true,
    groups: [currentGroup, nextGroup, doneGroup],
  },
};
