import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionHome from './index';

const meta = {
  title: 'Pages/Competition/Home',
  component: CompetitionHome,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026',
      routePath: '/competitions/:competitionId',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionHome>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
