import {
  CompatibleRound,
  getAdvancementConditionForRound,
  getRoundParticipationRuleset,
} from './wcif';

describe('wcif participation helpers', () => {
  it('backfills stable advancement conditions into a participation ruleset', () => {
    const rounds = [
      {
        id: '333-r1',
        format: 'a',
        results: [],
      },
      {
        id: '333-r2',
        format: 'a',
        advancementCondition: {
          type: 'ranking',
          level: 16,
        },
        results: [],
      },
    ] as unknown as CompatibleRound[];

    expect(getRoundParticipationRuleset(rounds, rounds[1])).toEqual({
      participationSource: {
        type: 'round',
        roundId: '333-r1',
        resultCondition: {
          type: 'ranking',
          value: 16,
        },
      },
    });
  });

  it('derives current-round advancement from the next round participation ruleset', () => {
    const rounds = [
      {
        id: '333-r1',
        format: 'a',
        results: [],
      },
      {
        id: '333-r2',
        format: 'a',
        participationRuleset: {
          participationSource: {
            type: 'round',
            roundId: '333-r1',
            resultCondition: {
              type: 'percent',
              value: 75,
            },
          },
        },
        results: [],
      },
    ] as unknown as CompatibleRound[];

    expect(getAdvancementConditionForRound(rounds, rounds[0])).toEqual({
      sourceType: 'round',
      sourceRoundIds: ['333-r1'],
      resultCondition: {
        type: 'percent',
        value: 75,
      },
      reservedPlaces: null,
    });
  });

  it('derives linked-round advancement from the next round participation ruleset', () => {
    const rounds = [
      {
        id: '333-r1',
        format: 'a',
        results: [],
      },
      {
        id: '333-r2',
        format: 'a',
        results: [],
      },
      {
        id: '333-r3',
        format: 'a',
        participationRuleset: {
          participationSource: {
            type: 'linkedRounds',
            roundIds: ['333-r1', '333-r2'],
            resultCondition: {
              type: 'ranking',
              value: 12,
            },
          },
        },
        results: [],
      },
    ] as unknown as CompatibleRound[];

    expect(getAdvancementConditionForRound(rounds, rounds[1])).toEqual({
      sourceType: 'linkedRounds',
      sourceRoundIds: ['333-r1', '333-r2'],
      resultCondition: {
        type: 'ranking',
        value: 12,
      },
      reservedPlaces: null,
    });
  });
});
