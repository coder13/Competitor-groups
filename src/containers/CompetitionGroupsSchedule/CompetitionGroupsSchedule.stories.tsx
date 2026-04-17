import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionGroupsScheduleContainer } from './CompetitionGroupsSchedule';

const meta = {
  title: 'Containers/Competition/Groups Schedule',
  component: CompetitionGroupsScheduleContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionGroupsScheduleContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};
