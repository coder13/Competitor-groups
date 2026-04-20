import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import { Competitors } from './Competitors';

const meta = {
  title: 'Containers/Competition/Competitors',
  component: Competitors,
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026',
      routePath: '/competitions/:competitionId/*',
    }),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    wcif: storybookCompetitionFixture,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Competitors>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutPinnedPeople: Story = {
  parameters: {
    pinnedPersons: [],
  },
};
