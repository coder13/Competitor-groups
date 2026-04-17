import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { LiveActivities } from './LiveActivities';

const meta = {
  title: 'Containers/Competition/Live Activities',
  component: LiveActivities,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LiveActivities>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
