import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import Events from './Events';

const meta = {
  title: 'Pages/Competition/Events',
  component: Events,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/events',
      routePath: '/competitions/:competitionId/events',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Events>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
