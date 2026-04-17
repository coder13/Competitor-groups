import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompareSchedules from './index';

const meta = {
  title: 'Pages/Competition/CompareSchedules',
  component: CompareSchedules,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/compare-schedules',
      routePath: '/competitions/:competitionId/compare-schedules',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompareSchedules>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
