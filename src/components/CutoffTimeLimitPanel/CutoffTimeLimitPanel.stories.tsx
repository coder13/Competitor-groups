import type { Meta, StoryObj } from '@storybook/react';
import { EventId } from '@wca/helpers';
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

// Synthetic edge cases for browser UAT, not a captured real competition.
const makeThresholdFixture = (
  eventId: EventId,
  scope: 'single' | 'average',
  value: number | null,
  linked = false,
) => {
  const competition = makeStorybookCompetitionFixtureWithRoundUpdates({});
  const rounds = competition.events[0].rounds.slice(0, linked ? 3 : 2).map((round, index) => ({
    ...round,
    id: `${eventId}-r${index + 1}`,
    cutoff: null,
    timeLimit: null,
    linkedRounds: null,
    participationRuleset: null,
    results: [],
  }));
  const target = rounds.at(-1)!;
  const participationRuleset = {
    reservedPlaces: null,
    participationSource: linked
      ? {
          type: 'linkedRounds' as const,
          roundIds: rounds.slice(0, -1).map(({ id }) => id),
          resultCondition: { type: 'resultAchieved' as const, scope, value },
        }
      : {
          type: 'round' as const,
          roundId: rounds[0].id,
          resultCondition: { type: 'resultAchieved' as const, scope, value },
        },
  };
  competition.events = [
    {
      id: eventId,
      rounds: [...rounds.slice(0, -1), { ...target, participationRuleset }],
      extensions: [],
    },
  ];
  return competition;
};
const thresholdStory = (
  eventId: EventId,
  scope: 'single' | 'average',
  value: number | null,
  linked = false,
): Story => {
  const fixture = makeThresholdFixture(eventId, scope, value, linked);
  return {
    parameters: { competitionFixture: fixture },
    args: { round: fixture.events[0].rounds[0] },
    decorators: [
      (Story) => (
        <div className="space-y-4">
          <p>Synthetic advancement-caption fixture</p>
          <Story />
        </div>
      ),
    ],
  };
};

export const SyntheticNullSingleThreshold = thresholdStory('333', 'single', null);
export const SyntheticNullAverageThreshold = thresholdStory('333', 'average', null);
export const SyntheticLinkedNullAverageThreshold = thresholdStory('333', 'average', null, true);
export const SyntheticFmcSingleThreshold = thresholdStory('333fm', 'single', 30);
export const SyntheticFmcAverageThreshold = thresholdStory('333fm', 'average', 3050);
export const SyntheticMultiBlindThreshold = thresholdStory('333mbf', 'single', 970036000);
