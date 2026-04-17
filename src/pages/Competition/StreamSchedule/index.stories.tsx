import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionStreamSchedule from './index';

const meta = {
  title: 'Pages/Competition/StreamSchedule',
  component: CompetitionStreamSchedule,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/stream',
      routePath: '/competitions/:competitionId/stream',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionStreamSchedule>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
