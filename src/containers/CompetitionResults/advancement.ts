import { RankingType, Round } from '@wca/helpers';
import { RoundAdvancementCondition } from '@/lib/wcif';
import { CompetitionRoundResult } from './CompetitionResultsTable';
import { normalizeResultRecordTag } from './ResultRecordBadge';

const averagedFormats = new Set(['a', 'm']);

const getPrimaryRankingType = (round: Pick<Round, 'format'>): RankingType =>
  averagedFormats.has(round.format) ? 'average' : 'single';

const getRankLimit = (
  resultCondition: RoundAdvancementCondition['resultCondition'],
  resultCount: number,
) => {
  if (resultCondition.type === 'ranking') {
    return resultCondition.value;
  }

  if (resultCondition.type === 'percent') {
    return Math.ceil((resultCount * resultCondition.value) / 100);
  }

  return null;
};

const getResultValue = (result: Round['results'][number], scope: RankingType) =>
  scope === 'average' ? result.average : result.best;

const isAdvancingFromStoredResult = (
  round: Round,
  result: Round['results'][number],
  advancementCondition: RoundAdvancementCondition | null,
  eventRounds: Round[],
) => {
  if (!advancementCondition) {
    return false;
  }

  const { resultCondition } = advancementCondition;
  // A dual-round percentage uses distinct competitors across both components,
  // including people who only competed in one. WCIF already supplies shared ranks.
  const sourceRounds =
    advancementCondition.sourceType === 'linkedRounds'
      ? eventRounds.filter((sourceRound) =>
          advancementCondition.sourceRoundIds.includes(sourceRound.id),
        )
      : [round];
  const sourceResults = sourceRounds.flatMap((sourceRound) => sourceRound.results);
  const rankedResultCount = new Set(
    sourceResults
      .filter((roundResult) => roundResult.ranking != null)
      .map((roundResult) => roundResult.personId),
  ).size;
  const rankLimit = getRankLimit(resultCondition, rankedResultCount);

  if (rankLimit != null) {
    return result.ranking != null && result.ranking <= rankLimit;
  }

  if (resultCondition.type !== 'resultAchieved') {
    return false;
  }

  if (resultCondition.value == null) {
    return false;
  }

  const scope = resultCondition.scope ?? getPrimaryRankingType(round);
  return sourceResults.some((sourceResult) => {
    const resultValue = getResultValue(sourceResult, scope);
    return (
      sourceResult.personId === result.personId &&
      resultValue > 0 &&
      resultValue < resultCondition.value!
    );
  });
};

export const getStoredRoundResults = (
  round: Round,
  advancementCondition: RoundAdvancementCondition | null,
  eventRounds: Round[] = [round],
): CompetitionRoundResult[] =>
  round.results.map((result) => {
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
      advancing: isAdvancingFromStoredResult(round, result, advancementCondition, eventRounds),
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
