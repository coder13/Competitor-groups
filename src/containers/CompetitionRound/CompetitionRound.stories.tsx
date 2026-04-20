import type { Meta, StoryObj } from '@storybook/react';
import {
  makeStorybookCompetitionFixtureWithRound,
  makeStorybookEventCompetitionFixture,
  storybookParticipationConditionLinkedRoundsFixture,
  storybookParticipationConditionPercentFixture,
} from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionRoundContainer } from './CompetitionRound';

const meta = {
  title: 'Containers/Competition/Round',
  component: CompetitionRoundContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionRoundContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoundOne: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r1',
  },
};

export const ParticipationConditionPercent: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionPercentFixture,
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r1',
  },
};

export const RoundTwo: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r2',
  },
};

export const ParticipationConditionLinkedRounds: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionLinkedRoundsFixture,
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r2',
  },
};

export const DualRoundWithPreviousRound: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionLinkedRoundsFixture,
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r2',
  },
};

export const DualRoundWithNextRound: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionLinkedRoundsFixture,
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r1',
  },
};

export const FinalRound: Story = {
  parameters: {
    competitionFixture: makeStorybookCompetitionFixtureWithRound('333-r3', (round) => ({
      ...round,
      advancementCondition: null,
    })),
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r3',
  },
};

export const CutoffAndTimeLimit: Story = {
  parameters: {
    competitionFixture: makeStorybookEventCompetitionFixture('222'),
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '222-r1',
  },
};

export const CumulativeTimeLimit: Story = {
  parameters: {
    competitionFixture: makeStorybookCompetitionFixtureWithRound('333-r2', (round) => ({
      ...round,
      timeLimit: {
        centiseconds: 15000,
        cumulativeRoundIds: ['333-r2', '333-r3'],
      },
      advancementCondition: {
        type: 'attemptResult',
        level: 950,
      },
    })),
  },
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roundId: '333-r2',
  },
};
