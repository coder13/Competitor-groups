import type { Meta, StoryObj } from '@storybook/react';
import {
  getStorybookRoundFixture,
  makeStorybookCompetitionFixtureWithRoundUpdates,
  storybookParticipationConditionLinkedRoundsFixture,
  storybookParticipationConditionPercentFixture,
} from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CutoffTimeLimitPanel } from './CutoffTimeLimitPanel';

const cumulativeTimeLimitCompetitionFixture = makeStorybookCompetitionFixtureWithRoundUpdates({
  '333-r2': (round) => ({
    ...round,
    timeLimit: {
      centiseconds: 15000,
      cumulativeRoundIds: ['333-r2', '333-r3'],
    },
  }),
  '333-r3': (round) => ({
    ...round,
    participationRuleset: {
      reservedPlaces: null,
      participationSource: {
        type: 'round',
        roundId: '333-r2',
        resultCondition: { type: 'resultAchieved', scope: 'single', value: 950 },
      },
    },
  }),
});

const finalRoundCompetitionFixture = makeStorybookCompetitionFixtureWithRoundUpdates({});

const meta = {
  title: 'Components/Competition/CutoffTimeLimitPanel',
  component: CutoffTimeLimitPanel,
  decorators: [
    makeCompetitionContainerDecorator(),
    (Story) => (
      <div className="w-full max-w-3xl rounded-md border border-tertiary bg-panel p-4 text-default">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CutoffTimeLimitPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RankingAdvancement: Story = {
  args: {
    round: getStorybookRoundFixture('333-r1'),
  },
};

export const ParticipationConditionPercent: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionPercentFixture,
  },
  args: {
    round: storybookParticipationConditionPercentFixture.events[0].rounds[0],
  },
};

export const ParticipationConditionLinkedRounds: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionLinkedRoundsFixture,
  },
  args: {
    round: storybookParticipationConditionLinkedRoundsFixture.events[0].rounds[1],
  },
};

export const ParticipationConditionLinkedRoundsStart: Story = {
  parameters: {
    competitionFixture: storybookParticipationConditionLinkedRoundsFixture,
  },
  args: {
    round: storybookParticipationConditionLinkedRoundsFixture.events[0].rounds[0],
  },
};

export const CutoffAndTimeLimit: Story = {
  args: {
    round: getStorybookRoundFixture('222-r1'),
  },
};

export const CumulativeTimeLimitWithRoundLinks: Story = {
  parameters: {
    competitionFixture: cumulativeTimeLimitCompetitionFixture,
  },
  args: {
    round: cumulativeTimeLimitCompetitionFixture.events[0].rounds[1],
  },
};

export const FinalRoundWithoutAdvancement: Story = {
  parameters: {
    competitionFixture: finalRoundCompetitionFixture,
  },
  args: {
    round: finalRoundCompetitionFixture.events[0].rounds[2],
  },
};
