import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionActivityContainer } from './CompetitionActivity';

const meta = {
  title: 'Containers/Competition/Activity',
  component: CompetitionActivityContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionActivityContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    activityId: 111,
  },
};

export const MissingActivity: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    activityId: 999999,
  },
};
