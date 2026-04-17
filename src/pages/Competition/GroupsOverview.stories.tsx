import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import GroupsOverview from './GroupsOverview';

const meta = {
  title: 'Pages/Competition/GroupsOverview',
  component: GroupsOverview,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/explore',
      routePath: '/competitions/:competitionId/explore',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupsOverview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
