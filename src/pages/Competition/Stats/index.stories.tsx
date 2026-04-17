import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionStatsPage from './index';

const meta = {
  title: 'Pages/Competition/Stats',
  component: CompetitionStatsPage,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/stats',
      routePath: '/competitions/:competitionId/stats',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionStatsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
