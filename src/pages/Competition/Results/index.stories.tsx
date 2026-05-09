import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionResultsPage from './index';

const meta = {
  title: 'Pages/Competition/Results',
  component: CompetitionResultsPage,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/results/333-r1',
      routePath: '/competitions/:competitionId/results/:roundId?',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionResultsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
