import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import ScramblerSchedule from './index';

const meta = {
  title: 'Pages/Competition/ScramblerSchedule',
  component: ScramblerSchedule,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/scramblers',
      routePath: '/competitions/:competitionId/scramblers',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScramblerSchedule>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
