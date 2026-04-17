import type { Meta, StoryObj } from '@storybook/react';
import { makeStorybookEventCompetitionFixture } from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionGroupContainer } from './CompetitionGroup';

const meta = {
  title: 'Containers/Competition/Group',
  component: CompetitionGroupContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionGroupContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r1',
    groupNumber: '1',
  },
};

export const GroupTwo: Story = {
  parameters: {
    competitionFixture: makeStorybookEventCompetitionFixture('333'),
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r1',
    groupNumber: '2',
  },
};
