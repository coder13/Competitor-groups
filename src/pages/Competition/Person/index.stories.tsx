import type { Meta, StoryObj } from '@storybook/react';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import PersonPage from './index';

const meta = {
  title: 'Pages/Competition/Person',
  component: PersonPage,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/persons/1',
      routePath: '/competitions/:competitionId/persons/:registrantId',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PersonPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
