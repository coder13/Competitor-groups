import type { Meta, StoryObj } from '@storybook/react';
import { Competition, Round } from '@wca/helpers';
import { makeStorybookCompetitionFixtureWithRoundUpdates } from '@/storybook/competitionFixtures';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionResultsTable } from './CompetitionResultsTable';
import { getRoundResultsFromSources } from './resultsProvider';

const makeFixture = (partial: boolean, actualParticipants: boolean): Competition => {
  const competition = makeStorybookCompetitionFixtureWithRoundUpdates({});
  competition.id = 'SyntheticAdvancementFixture';
  competition.persons = Array.from({ length: 10 }, (_, index) => ({
    ...competition.persons[0],
    registrantId: index + 1,
    wcaId: null,
    name: `Synthetic Solver ${index + 1}`,
    assignments: [],
  }));
  const source: Round = {
    ...competition.events[0].rounds[0],
    cutoff: null,
    format: 'a',
    linkedRounds: null,
    results: Array.from({ length: 10 }, (_, index) => {
      const entered = !partial || index < 6;
      return {
        personId: index + 1,
        ranking: entered ? index + 1 : null,
        best: entered ? 1000 + index * 100 : 0,
        average: partial ? 0 : 1000 + index * 100,
        attempts: !entered
          ? []
          : Array.from({ length: partial ? 1 : 5 }, () => ({
              value: 1000 + index * 100,
              reconstruction: null,
            })),
      };
    }),
  };
  const target: Round = {
    ...competition.events[0].rounds[1],
    linkedRounds: null,
    participationRuleset: {
      reservedPlaces: null,
      participationSource: {
        type: 'round',
        roundId: source.id,
        resultCondition: { type: 'percent', scope: 'average', value: 75 },
      },
    },
    results: actualParticipants
      ? [1, 2, 3, 5, 6, 8].map((personId) => ({
          personId,
          ranking: null,
          best: 0,
          average: 0,
          attempts: [],
        }))
      : [],
  };
  competition.events = [{ ...competition.events[0], rounds: [source, target] }];
  return competition;
};

const meta = {
  title: 'Components/Competition/FallbackAdvancement',
  component: CompetitionResultsTable,
  decorators: [makeCompetitionContainerDecorator()],
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionResultsTable>;
export default meta;
type Story = StoryObj<typeof meta>;

const fixtureStory = (
  partial: boolean,
  actualParticipants: boolean,
  description: string,
): Story => {
  const competition = makeFixture(partial, actualParticipants);
  const event = competition.events[0];
  const round = event.rounds[0];
  return {
    parameters: { competitionFixture: competition },
    args: {
      competitionId: competition.id,
      eventId: event.id,
      round,
      persons: competition.persons,
      results: getRoundResultsFromSources({
        wcif: competition,
        selectedRound: { event, round, roundNumber: 1 },
        wcaApiResults: [],
        wcaLiveRound: null,
      }),
    },
    decorators: [
      (Story) => (
        <div className="space-y-4">
          <p>{description}</p>
          <Story />
        </div>
      ),
    ],
  };
};

export const SyntheticPartialRoster = fixtureStory(
  true,
  false,
  'Synthetic partial snapshot: ten stored participants, six with one of five attempts. The six currently qualifying ranks are yellow, not settled green.',
);
export const SyntheticCompletedRoster = fixtureStory(
  false,
  false,
  'Synthetic completed snapshot: ten participants with five attempts each. Seven calculated qualifiers are green.',
);
export const SyntheticActualParticipants = fixtureStory(
  false,
  true,
  'Synthetic next-round roster: participants 1, 2, 3, 5, 6, and 8 are green. Actual participation overrides calculated eligibility.',
);
