import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionCompareSchedulesContainer } from './CompetitionCompareSchedules';

const meta = {
  title: 'Containers/Competition/Compare Schedules',
  component: CompetitionCompareSchedulesContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionCompareSchedulesContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
};
