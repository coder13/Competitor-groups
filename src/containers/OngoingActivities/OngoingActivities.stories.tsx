import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import { OngoingActivities } from './OngoingActivities';

const meta = {
  title: 'Containers/Competition/Ongoing Activities',
  component: OngoingActivities,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026',
      routePath: '/competitions/:competitionId/*',
    }),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OngoingActivities>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithLiveActivities: Story = {};

export const OrganizerPrompt: Story = {
  parameters: {
    ongoingActivities: [],
  },
};
