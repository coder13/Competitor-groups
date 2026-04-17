import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { ActivityRow } from './ActivityRow';

const mainRoom = storybookCompetitionFixture.schedule.venues[0].rooms[0];
const stageActivity = mainRoom.activities[0].childActivities[0];
const otherActivity = storybookCompetitionFixture.schedule.venues[0].rooms[1].activities[1];

const meta = {
  title: 'Components/Competition/ActivityRow',
  component: ActivityRow,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl bg-panel">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithStage: Story = {
  args: {
    activity: stageActivity,
    competitionId: storybookCompetitionFixture.id,
    stage: {
      name: 'Blue Stage',
      color: '#3b82f6',
    },
    timeZone: 'America/Los_Angeles',
  },
};

export const WithoutStage: Story = {
  args: {
    activity: otherActivity,
    competitionId: storybookCompetitionFixture.id,
    timeZone: 'America/Los_Angeles',
    showRoom: false,
  },
};
