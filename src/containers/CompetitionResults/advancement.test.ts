import { ResultCondition, Round } from '@wca/helpers';
import { getAdvancementConditionForRound, getLinkedRoundIds } from '@/lib/wcif';
import { getQualifyingResultKeys, getStoredRoundResults, hasExpectedAttempts } from './advancement';
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
      // The actual target participants override the earlier eligibility estimate.
      const targetIds = new Set(rounds[2].results.map(({ personId }) => personId));
      expect(results.filter(({ advancing }) => advancing).map(({ personId }) => personId)).toEqual(
        round.results
          .filter(({ personId, ranking }) => ranking != null && targetIds.has(personId))
          .map(({ personId }) => personId),
      );
      const condition = getAdvancementConditionForRound(rounds, round)!;
      const entrants = new Set(
        rounds.slice(0, 2).flatMap(({ results }) => results.map(({ personId }) => personId)),
      ).size;
      const limit =
        condition.resultCondition.type === 'percent'
          ? Math.floor((entrants * condition.resultCondition.value) / 100)
          : condition.resultCondition.value!;
      const qualifying = getQualifyingResultKeys(
        round,
        condition,
        rounds
          .slice(0, 2)
          .flatMap(({ results }) =>
            results.map((result) => ({ ...result, key: String(result.personId) })),
          ),
      );
      expect(
        round.results.every(
          ({ personId, ranking }) =>
            qualifying.has(String(personId)) === (ranking != null && ranking <= limit),
        ),
      ).toBe(true);
    }
  });
});

const qualifiers = (
  results: Round['results'],
  condition: ResultCondition,
  format: Round['format'] = 'a',
) => {
  const round = { ...makeRound('333-r1', results), format };
  return getStoredRoundResults(round, {
    sourceType: 'round',
    sourceRoundIds: [round.id],
    resultCondition: condition,
  }).filter(({ advancing }) => advancing);
};
const rankedResults = (count: number) =>
  Array.from({ length: count }, (_, i) => result(i + 1, i + 1, 800 + i * 100));

describe('stored qualification rules', () => {
  it.each([
    [11, 8],
    [15, 11],
    [17, 12],
  ])('rounds 75%% of %i scored entrants down to %i', (count, expected) => {
    expect(
      qualifiers(rankedResults(count), { type: 'percent', scope: 'average', value: 75 }),
    ).toHaveLength(expected);
  });

  it('caps a configured top 10 at six of eight entrants', () => {
    expect(
      qualifiers(rankedResults(8), { type: 'ranking', scope: 'average', value: 10 }),
    ).toHaveLength(6);
  });

  it('keeps a top-N tie together when it stays below the elimination cap', () => {
    const results = rankedResults(20);
    results[6].ranking = 6;
    expect(
      qualifiers(results, { type: 'ranking', scope: 'average', value: 6 }).map(
        ({ personId }) => personId,
      ),
    ).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it.each<ResultCondition>([
    { type: 'ranking', scope: 'average', value: 15 },
    { type: 'percent', scope: 'average', value: 75 },
    { type: 'resultAchieved', scope: 'average', value: 10000 },
    { type: 'resultAchieved', scope: 'average', value: null },
  ])('excludes a whole tied group crossing the cap for %j', (condition) => {
    const results = rankedResults(20);
    results[15].ranking = 15;
    results[16].ranking = 15;
    expect(qualifiers([...results].reverse(), condition)).toHaveLength(14);
  });

  it('counts failed results in the population but never qualifies all-DNF or DNS entrants', () => {
    const results = rankedResults(16);
    results[6].average = -1; // A successful single still makes this competitor eligible.
    results.slice(7).forEach((entry, i) => {
      entry.best = i % 2 ? -1 : -2;
      entry.average = -1;
      entry.ranking = 8;
    });
    expect(
      qualifiers(results, { type: 'percent', scope: 'average', value: 50 }).map(
        ({ personId }) => personId,
      ),
    ).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('counts empty participant rows in the roster but never highlights them', () => {
    const results: Round['results'] = [
      ...rankedResults(6),
      ...Array.from({ length: 4 }, (_, index) => ({
        ...result(index + 7, 0, 0),
        ranking: null,
        attempts: [],
      })),
    ];
    const advancing = qualifiers(results, { type: 'percent', scope: 'average', value: 75 });
    expect(advancing.map(({ personId }) => personId)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(advancing.every(({ advancingQuestionable }) => advancingQuestionable)).toBe(true);
  });

  it('treats a null threshold as any successful value in the requested scope', () => {
    const results = rankedResults(8);
    results[1].average = -1;
    results[2].average = -2;
    results[3].average = 0;
    expect(
      qualifiers(results, { type: 'resultAchieved', scope: 'average', value: null }).map(
        ({ personId }) => personId,
      ),
    ).toEqual([1, 5, 6]);
    expect(
      qualifiers(results, { type: 'resultAchieved', scope: 'single', value: null }),
    ).toHaveLength(6);
  });

  it('requires a value strictly better than a non-null threshold', () => {
    expect(
      qualifiers(rankedResults(8), {
        type: 'resultAchieved',
        scope: 'average',
        value: 1000,
      }).map(({ personId }) => personId),
    ).toEqual([1, 2]);
  });

  it('allows success in either linked component without replacing displayed DNF values', () => {
    const rounds = linkedRounds({ type: 'ranking', scope: 'average', value: 3 });
    rounds[0].results[0] = { ...result(1, 2, -1), best: -1 };
    rounds[1].results[0] = { ...result(1, 2, -1), best: 900 };
    expect(
      getStoredRoundResults(
        rounds[0],
        getAdvancementConditionForRound(rounds, rounds[0]),
        rounds,
      )[0],
    ).toMatchObject({ ranking: 2, best: -1, average: -1, advancing: true });
  });

  it('keeps an empty component row unhighlighted without losing sibling eligibility', () => {
    const rounds = linkedRounds({ type: 'ranking', scope: 'average', value: 3 });
    rounds[0].results[0] = {
      ...result(1, 2, 0),
      ranking: null,
      attempts: [],
    };
    const condition = getAdvancementConditionForRound(rounds, rounds[0]);
    expect(getStoredRoundResults(rounds[0], condition, rounds)[0]).toMatchObject({
      ranking: null,
      best: 0,
      average: 0,
      attempts: [],
      advancing: false,
    });
    expect(getStoredRoundResults(rounds[1], condition, rounds)[0].advancing).toBe(true);
  });

  it('does not qualify a final or an entirely empty round', () => {
    expect(getStoredRoundResults(makeRound('333-r1', rankedResults(8)), null)).toEqual(
      expect.arrayContaining([expect.objectContaining({ advancing: false })]),
    );
    expect(qualifiers([], { type: 'ranking', scope: 'average', value: 10 })).toEqual([]);
  });
});

const fullResult = (personId: number, ranking: number, average = 1000) => ({
  ...result(personId, ranking, average),
  attempts: Array.from({ length: 5 }, () => ({ value: average, reconstruction: null })),
});
const withTarget = (rounds: Round[]) => {
  rounds[1].participationRuleset = {
    reservedPlaces: null,
    participationSource: {
      type: 'round',
      roundId: rounds[0].id,
      resultCondition: { type: 'percent', scope: 'average', value: 75 },
    },
  };
  return rounds;
};

describe('fallback qualification certainty and participation', () => {
  it('settles calculated eligibility when all source attempts are complete', () => {
    const rounds = withTarget([
      makeRound(
        '333-r1',
        Array.from({ length: 8 }, (_, i) => fullResult(i + 1, i + 1)),
      ),
      makeRound('333-r2'),
    ]);
    const results = getStoredRoundResults(
      rounds[0],
      getAdvancementConditionForRound(rounds, rounds[0]),
      rounds,
    );
    expect(results.filter(({ advancing }) => advancing)).toHaveLength(6);
    expect(results.every(({ advancingQuestionable }) => !advancingQuestionable)).toBe(true);
  });

  it('keeps every calculated qualifier provisional when even one row is partial', () => {
    const rounds = withTarget([
      makeRound(
        '333-r1',
        Array.from({ length: 8 }, (_, i) => fullResult(i + 1, i + 1)),
      ),
      makeRound('333-r2'),
    ]);
    rounds[0].results[7].attempts = [{ value: 1100, reconstruction: null }];
    const results = getStoredRoundResults(
      rounds[0],
      getAdvancementConditionForRound(rounds, rounds[0]),
      rounds,
    );
    expect(
      results
        .filter(({ advancing }) => advancing)
        .every(({ advancingQuestionable }) => advancingQuestionable),
    ).toBe(true);
    expect(
      results
        .filter(({ advancing }) => !advancing)
        .every(({ advancingQuestionable }) => !advancingQuestionable),
    ).toBe(true);
  });

  it.each(['missing', 'empty', 'partial'])(
    'does not settle linked eligibility when a component is %s',
    (state) => {
      const rounds = linkedRounds({ type: 'ranking', scope: 'average', value: 3 });
      rounds[0].results = Array.from({ length: 4 }, (_, i) => fullResult(i + 1, i + 1));
      rounds[1].results = state === 'partial' ? [result(1, 1, 900)] : [];
      const condition = getAdvancementConditionForRound(rounds, rounds[0]);
      const sourceRounds = state === 'missing' ? [rounds[0], rounds[2]] : rounds;
      expect(getStoredRoundResults(rounds[0], condition, sourceRounds)[0]).toMatchObject({
        advancing: true,
        advancingQuestionable: true,
      });
    },
  );

  it('uses actual next-round participants, including blank rows, over theoretical qualifiers', () => {
    const rounds = withTarget([
      makeRound(
        '333-r1',
        Array.from({ length: 8 }, (_, i) => result(i + 1, i + 1, 1000)),
      ),
      makeRound('333-r2', [
        { ...result(1, 0, 0), ranking: null, attempts: [] },
        { ...result(8, 0, 0), ranking: null, attempts: [] },
      ]),
    ]);
    const results = getStoredRoundResults(
      rounds[0],
      getAdvancementConditionForRound(rounds, rounds[0]),
      rounds,
    );
    expect(results.filter(({ advancing }) => advancing).map(({ personId }) => personId)).toEqual([
      1, 8,
    ]);
    expect(results.every(({ advancingQuestionable }) => !advancingQuestionable)).toBe(true);
  });

  it('uses the union if a future WCIF target stage has linked components', () => {
    // Current WCA dual rounds are first-round only. This covers WCIF's extensible links.
    const rounds = withTarget([
      makeRound(
        '333-r1',
        Array.from({ length: 8 }, (_, i) => result(i + 1, i + 1, 1000)),
      ),
      makeRound('333-r2', [result(1, 1, 1000)]),
      makeRound('333-r3', [result(8, 1, 900)]),
    ]);
    rounds[1].linkedRounds = ['333-r2', '333-r3'];
    rounds[2].linkedRounds = ['333-r2', '333-r3'];
    expect(
      getStoredRoundResults(rounds[0], getAdvancementConditionForRound(rounds, rounds[0]), rounds)
        .filter(({ advancing }) => advancing)
        .map(({ personId }) => personId),
    ).toEqual([1, 8]);
  });
});

describe('expected attempts in stored snapshots', () => {
  it.each<[Round['format'], number]>([
    ['1', 1],
    ['2', 2],
    ['3', 3],
    ['5', 5],
    ['a', 5],
    ['m', 3],
  ])('recognizes completed format %s and rejects one missing attempt', (format, count) => {
    const round = { ...makeRound('333-r1'), format };
    const attempts = Array.from({ length: count }, () => ({ result: -1 }));
    expect(hasExpectedAttempts(round, { attempts })).toBe(true);
    expect(hasExpectedAttempts(round, { attempts: attempts.slice(1) })).toBe(false);
    expect(hasExpectedAttempts(round, { attempts: [...attempts.slice(1), { result: 0 }] })).toBe(
      false,
    );
    expect(
      hasExpectedAttempts(round, { attempts: [...attempts, { result: 0 }, { result: 0 }] }),
    ).toBe(true);
  });

  it('recognizes a missed cutoff, but requires all attempts once the cutoff is met', () => {
    const round = { ...makeRound('333-r1'), cutoff: { numberOfAttempts: 2, resultValue: 1000 } };
    const hasAttempts = (values: number[]) =>
      hasExpectedAttempts(round, { attempts: values.map((result) => ({ result })) });
    expect(hasAttempts([1200])).toBe(false);
    expect(hasAttempts([1200, -1, 0, 0, 0])).toBe(true);
    expect(hasAttempts([-2, -2])).toBe(true);
    expect(hasAttempts([1000, 1000])).toBe(true); // equality does not meet the cutoff
    expect(hasAttempts([900, -1])).toBe(false);
    expect(hasAttempts([900, -1, -2, 1000, 1100])).toBe(true);
    expect(hasAttempts([900, -1, -2, 1000, 0])).toBe(false);
  });

  it('does not infer completion for an unsupported head-to-head format', () => {
    expect(hasExpectedAttempts({ ...makeRound('333-r1'), format: 'h' }, { attempts: [] })).toBe(
      false,
    );
  });
});
