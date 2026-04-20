import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import GroupsSchedule from './GroupsSchedule';

const meta = {
  title: 'Pages/Competition/GroupsSchedule',
  component: GroupsSchedule,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/groups-schedule',
      routePath: '/competitions/:competitionId/groups-schedule',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GroupsSchedule>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
