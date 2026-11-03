import { ParticipationRuleset, ResultCondition, Round } from '@wca/helpers';
import { getAdvancementConditionForRound } from './wcif';

const makeRound = (
  id: string,
  participationRuleset: ParticipationRuleset | null = null,
): Round => ({
  id,
  format: 'a',
  linkedRounds: null,
  timeLimit: null,
  cutoff: null,
  participationRuleset,
  results: [],
  extensions: [],
});

describe('wcif participation helpers', () => {
  it.each<ResultCondition>([
    { type: 'ranking', scope: 'average', value: 16 },
    { type: 'percent', scope: 'average', value: 75 },
    { type: 'resultAchieved', scope: 'single', value: 1000 },
  ])('derives current-round advancement from the next round $type ruleset', (resultCondition) => {
    const rounds = [
      makeRound('333-r1'),
      makeRound('333-r2', {
        participationSource: { type: 'round', roundId: '333-r1', resultCondition },
        reservedPlaces: null,
      }),
    ];

    expect(getAdvancementConditionForRound(rounds, rounds[0])).toEqual({
      sourceType: 'round',
      sourceRoundIds: ['333-r1'],
      targetRoundId: '333-r2',
      resultCondition,
      reservedPlaces: null,
    });
    expect(getAdvancementConditionForRound(rounds, rounds[1])).toBeNull();
  });

  it('derives linked-round advancement and preserves reserved places', () => {
    const resultCondition: ResultCondition = { type: 'ranking', scope: 'average', value: 12 };
    const reservedPlaces = { nationalities: ['US'], reservations: 2 };
    const rounds = [
      makeRound('333-r1'),
      makeRound('333-r2'),
      makeRound('333-r3', {
        participationSource: {
          type: 'linkedRounds',
          roundIds: ['333-r1', '333-r2'],
          resultCondition,
        },
        reservedPlaces,
      }),
    ];

    for (const round of rounds.slice(0, 2)) {
      expect(getAdvancementConditionForRound(rounds, round)).toEqual({
        sourceType: 'linkedRounds',
        sourceRoundIds: ['333-r1', '333-r2'],
        targetRoundId: '333-r3',
        resultCondition,
        reservedPlaces,
      });
    }
  });

  it.each<ParticipationRuleset | null>([
    null,
    { participationSource: null, reservedPlaces: null },
    { participationSource: { type: 'registrations' }, reservedPlaces: null },
    {
      participationSource: { type: 'round', roundId: '333-r1', resultCondition: null },
      reservedPlaces: null,
    },
    {
      participationSource: { type: 'linkedRounds', roundIds: ['333-r1'], resultCondition: null },
      reservedPlaces: null,
    },
  ])('does not invent an advancement threshold when none is supplied (%j)', (ruleset) => {
    const rounds = [makeRound('333-r1'), makeRound('333-r2', ruleset)];
    expect(getAdvancementConditionForRound(rounds, rounds[0])).toBeNull();
  });
});
