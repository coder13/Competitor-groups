import { ResultCondition, Round } from '@wca/helpers';
import { getAdvancementConditionForRound, getLinkedRoundIds } from '@/lib/wcif';
import { getStoredRoundResults } from './advancement';
import * as hongKongRounds from './fixtures/CubeAgainstCancerHongKong2026.json';
import * as fmcRounds from './fixtures/FMCEastMelbourne2026.json';

const makeRound = (id: string, results: Round['results'] = []): Round => ({
  id,
  format: 'a',
  linkedRounds: null,
  participationRuleset: null,
  cutoff: null,
  timeLimit: null,
  results,
  extensions: [],
});
const result = (personId: number, ranking: number, average: number) => ({
  personId,
  ranking,
  average,
  best: average,
  attempts: [{ value: average, reconstruction: null }],
});
const linkedRounds = (condition: ResultCondition) => {
  const rounds = [
    makeRound('333-r1', [result(1, 2, 1500), result(2, 3, 2000)]),
    makeRound('333-r2', [result(1, 2, 900), result(3, 1, 800), result(4, 4, 2200)]),
    makeRound('333-r3'),
  ];
  rounds[2].participationRuleset = {
    participationSource: {
      type: 'linkedRounds',
      roundIds: ['333-r1', '333-r2'],
      resultCondition: condition,
    },
    reservedPlaces: null,
  };
  return rounds;
};

describe('dual-round stored results', () => {
  it('uses the distinct union of entrants for percentage advancement', () => {
    const rounds = linkedRounds({ type: 'percent', scope: 'average', value: 50 });
    const results = getStoredRoundResults(
      rounds[0],
      getAdvancementConditionForRound(rounds, rounds[0]),
      rounds,
    );
    expect(results.map(({ personId, advancing }) => ({ personId, advancing }))).toEqual([
      { personId: 1, advancing: true },
      { personId: 2, advancing: false },
    ]);
  });

  it('checks result thresholds in either component without replacing component values or rank', () => {
    const rounds = linkedRounds({ type: 'resultAchieved', scope: 'average', value: 1000 });
    const results = getStoredRoundResults(
      rounds[0],
      getAdvancementConditionForRound(rounds, rounds[0]),
      rounds,
    );
    expect(results[0]).toMatchObject({
      ranking: 2,
      average: 1500,
      advancing: true,
      attempts: [{ result: 1500 }],
    });
    expect(results[1].advancing).toBe(false);
  });

  it('does not qualify DNF, DNS or missing values through a result threshold', () => {
    const rounds = linkedRounds({ type: 'resultAchieved', scope: 'average', value: 1000 });
    rounds[0].results[0].average = -1;
    rounds[1].results[0].average = -2;
    expect(
      getStoredRoundResults(
        rounds[0],
        getAdvancementConditionForRound(rounds, rounds[0]),
        rounds,
      )[0].advancing,
    ).toBe(false);
  });

  it.each([
    ['FMC East Melbourne 2026', fmcRounds],
    ['Cube Against Cancer Hong Kong 2026', hongKongRounds],
  ])('preserves official shared ranks and component results for %s', (_, fixture) => {
    const rounds = fixture as Round[];
    for (const round of rounds.slice(0, 2)) {
      expect(getLinkedRoundIds(rounds, round)).toEqual(rounds.slice(0, 2).map(({ id }) => id));
      const results = getStoredRoundResults(
        round,
        getAdvancementConditionForRound(rounds, round),
        rounds,
      );
      expect(
        results.map(({ personId, ranking, best, average }) => ({
          personId,
          ranking,
          best,
          average,
        })),
      ).toEqual(
        round.results.map(({ personId, ranking, best, average }) => ({
          personId,
          ranking,
          best,
          average,
        })),
      );
      // Later participation may differ after withdrawals and replacements. Keep
      // this assertion on the stated qualifying condition, not the final roster.
      const condition = getAdvancementConditionForRound(rounds, round)!;
      const entrants = new Set(
        rounds.slice(0, 2).flatMap(({ results }) => results.map(({ personId }) => personId)),
      ).size;
      const limit =
        condition.resultCondition.type === 'percent'
          ? Math.ceil((entrants * condition.resultCondition.value) / 100)
          : condition.resultCondition.value!;
      expect(
        results.every(
          ({ ranking, advancing }) => advancing === (ranking != null && ranking <= limit),
        ),
      ).toBe(true);
    }
  });
});
