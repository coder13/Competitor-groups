import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import LivePage from './index';

const meta = {
  title: 'Pages/Competition/Live',
  component: LivePage,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/live',
      routePath: '/competitions/:competitionId/live',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LivePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
