import { RankingType, Round } from '@wca/helpers';
import { RoundAdvancementCondition } from '@/lib/wcif';
import { CompetitionRoundResult } from './CompetitionResultsTable';
import { normalizeResultRecordTag } from './ResultRecordBadge';

const averagedFormats = new Set(['a', 'm']);

const getPrimaryRankingType = (round: Pick<Round, 'format'>): RankingType =>
  averagedFormats.has(round.format) ? 'average' : 'single';

type QualificationResult = Pick<CompetitionRoundResult, 'ranking' | 'best' | 'average'> & {
  // Stable competitor identity across all source rounds, not the component result ID.
  key: string;
};

export const getQualifyingResultKeys = (
  round: Pick<Round, 'format'>,
  advancementCondition: RoundAdvancementCondition | null,
  sourceResults: QualificationResult[],
): Set<string> => {
  if (!advancementCondition) return new Set();

  const { resultCondition } = advancementCondition;
  const resultsByPerson = new Map<string, QualificationResult[]>();
  sourceResults.forEach((result) => {
    const personResults = resultsByPerson.get(result.key) ?? [];
    personResults.push(result);
    resultsByPerson.set(result.key, personResults);
  });

  // WCIF supplies official ranks shared across linked components. Count each
  // scored competitor once; an empty, unranked roster row is not a result.
  const rankingsByPerson = new Map<string, number>();
  resultsByPerson.forEach((results, key) => {
    const rankings = results.flatMap(({ ranking }) =>
      ranking != null && ranking > 0 ? [ranking] : [],
    );
    if (rankings.length > 0) rankingsByPerson.set(key, Math.min(...rankings));
  });
  const rankings = [...rankingsByPerson.values()].sort((a, b) => a - b);
  const resultCount = rankings.length;
  const maxQualifying = Math.floor(resultCount * 0.75);
  // WCA Live's qualification algorithm excludes the entire tied group if it
  // crosses the 75% cap (9p1). Never break an official tie by array order.
  const firstNonQualifyingRanking = rankings[maxQualifying] ?? Infinity;
  const rankLimit =
    resultCondition.type === 'ranking'
      ? resultCondition.value
      : resultCondition.type === 'percent'
        ? Math.floor((resultCount * resultCondition.value) / 100)
        : null;
  const scope = resultCondition.scope ?? getPrimaryRankingType(round);

  return new Set(
    [...resultsByPerson].flatMap(([key, results]) => {
      const ranking = rankingsByPerson.get(key);
      if (
        ranking == null ||
        ranking >= firstNonQualifyingRanking ||
        // A DNF average is still eligible when either component has a successful
        // single. Only all-DNF/DNS results are excluded by 9p4.
        !results.some(({ best }) => best > 0)
      ) {
        return [];
      }

      const satisfiesCondition =
        rankLimit != null
          ? ranking <= rankLimit
          : resultCondition.type === 'resultAchieved' &&
            results.some((result) => {
              const value = scope === 'average' ? result.average : result.best;
              return value > 0 && (resultCondition.value == null || value < resultCondition.value);
            });
      return satisfiesCondition ? [key] : [];
    }),
  );
};

export const getStoredRoundResults = (
  round: Round,
  advancementCondition: RoundAdvancementCondition | null,
  eventRounds: Round[] = [round],
): CompetitionRoundResult[] => {
  const sourceRounds =
    advancementCondition?.sourceType === 'linkedRounds'
      ? eventRounds.filter(({ id }) => advancementCondition.sourceRoundIds.includes(id))
      : [round];
  const qualifyingKeys = getQualifyingResultKeys(
    round,
    advancementCondition,
    sourceRounds.flatMap(({ results }) =>
      results.map((result) => ({ ...result, key: String(result.personId) })),
    ),
  );

  return round.results.map((result) => {
    const resultWithRecords = result as typeof result & {
      regionalSingleRecord?: string | null;
      regionalAverageRecord?: string | null;
      singleRecordTag?: string | null;
      averageRecordTag?: string | null;
    };

    return {
      id: result.personId,
      personId: result.personId,
      ranking: result.ranking,
      advancing: result.ranking != null && qualifyingKeys.has(String(result.personId)),
      advancingQuestionable: false,
      attempts: result.attempts.map((attempt) => ({ result: attempt.value })),
      best: result.best,
      average: result.average,
      singleRecordTag: normalizeResultRecordTag(
        resultWithRecords.singleRecordTag ?? resultWithRecords.regionalSingleRecord,
      ),
      averageRecordTag: normalizeResultRecordTag(
        resultWithRecords.averageRecordTag ?? resultWithRecords.regionalAverageRecord,
      ),
    };
  });
};
