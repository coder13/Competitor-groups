import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import GroupList from './GroupList';

const meta = {
  title: 'Pages/Competition/Round',
  component: GroupList,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/events/333-r1',
      routePath: '/competitions/:competitionId/events/:roundId',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
