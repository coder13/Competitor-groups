import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import Information from './index';

const meta = {
  title: 'Pages/Competition/Information',
  component: Information,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/information',
      routePath: '/competitions/:competitionId/information',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Information>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
