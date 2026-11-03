import { RankingType, Round, getFormatExpectedSolves } from '@wca/helpers';
import { RoundAdvancementCondition, getLinkedRoundIds } from '@/lib/wcif';
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

  // WCIF supplies official ranks shared across linked components. Like Live,
  // count every participant result row, including an empty one, exactly once.
  // Scheduled group assignments are not evidence of current participation.
  const rankingsByPerson = new Map<string, number>();
  resultsByPerson.forEach((results, key) => {
    const rankings = results.flatMap(({ ranking }) =>
      ranking != null && ranking > 0 ? [ranking] : [],
    );
    if (rankings.length > 0) rankingsByPerson.set(key, Math.min(...rankings));
  });
  const rankings = [...rankingsByPerson.values()].sort((a, b) => a - b);
  const resultCount = resultsByPerson.size;
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

type QualificationRound = {
  round: Pick<Round, 'format' | 'cutoff'>;
  results: (QualificationResult & Pick<CompetitionRoundResult, 'attempts'>)[];
};

export const hasExpectedAttempts = (
  round: Pick<Round, 'format' | 'cutoff'>,
  result: Pick<CompetitionRoundResult, 'attempts'>,
): boolean => {
  const maxAttempts = getFormatExpectedSolves(round.format);
  if (maxAttempts === 0) return false;

  // Published API results can be padded with zeros. A trailing zero is missing,
  // not an entered attempt; an interior skipped attempt still occupies its slot.
  const attempts = result.attempts.map(({ result }) => result);
  while (attempts.at(-1) === 0) attempts.pop();
  const meetsCutoff =
    !round.cutoff ||
    attempts
      .slice(0, round.cutoff.numberOfAttempts)
      .some((value) => value > 0 && value < round.cutoff!.resultValue);
  const expected = meetsCutoff ? maxAttempts : round.cutoff!.numberOfAttempts;
  return attempts.length === expected;
};

/**
 * Stored snapshots can establish next-round participation or estimate eligibility.
 * Live exports all result rows, including blank ones, so a populated target round
 * is the participant list, not a reason to reapply the previous qualifying rule.
 * https://github.com/thewca/wca-live/blob/main/lib/wca_live/scoretaking/advancing.ex
 *
 * For incomplete snapshots we deliberately do not claim Live's clinching parity:
 * all calculated qualifiers remain provisional until the source results are
 * complete. WCIF has no Live edit history or organizer-only disqualification state.
 */
export const getFallbackAdvancement = (
  round: Pick<Round, 'format'>,
  advancementCondition: RoundAdvancementCondition | null,
  sourceRounds: QualificationRound[],
  targetResults: (Pick<QualificationResult, 'key'> & { identityResolved?: boolean })[] = [],
  sourceIdentityComplete = true,
): { advancingKeys: Set<string>; questionableKeys: Set<string> } => {
  if (!advancementCondition) return { advancingKeys: new Set(), questionableKeys: new Set() };
  const actualParticipantKeys = new Set(
    targetResults
      .filter(({ identityResolved }) => identityResolved !== false)
      .map(({ key }) => key),
  );
  const targetIdentityComplete = targetResults.every(
    ({ identityResolved }) => identityResolved !== false,
  );
  if (targetResults.length > 0 && targetIdentityComplete) {
    return { advancingKeys: actualParticipantKeys, questionableKeys: new Set() };
  }

  const sourceResults = sourceRounds.flatMap(({ results }) => results);
  const qualifyingKeys = sourceIdentityComplete
    ? getQualifyingResultKeys(round, advancementCondition, sourceResults)
    : new Set<string>();
  const complete =
    targetIdentityComplete &&
    sourceRounds.length === advancementCondition.sourceRoundIds.length &&
    sourceRounds.every(
      ({ round, results }) =>
        results.length > 0 && results.every((result) => hasExpectedAttempts(round, result)),
    );

  // Unidentified target rows cannot prove that a known qualifier was excluded.
  // Keep those estimates provisional, but settle the actual matches we do know.
  return {
    advancingKeys: new Set([...qualifyingKeys, ...actualParticipantKeys]),
    questionableKeys: new Set(
      [...qualifyingKeys].filter((key) => !complete && !actualParticipantKeys.has(key)),
    ),
  };
};

/** Never interpret a linked source component as evidence of later participation. */
export const getAdvancementTargetRoundIds = (
  eventRounds: Round[],
  advancementCondition: RoundAdvancementCondition | null,
): string[] => {
  const targetRound = eventRounds.find(({ id }) => id === advancementCondition?.targetRoundId);
  if (!targetRound || !advancementCondition) return [];
  const linkedTargetIds = getLinkedRoundIds(eventRounds, targetRound);
  return linkedTargetIds.length > 0 &&
    !linkedTargetIds.some((id) => advancementCondition.sourceRoundIds.includes(id))
    ? linkedTargetIds
    : [targetRound.id];
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
  const targetRoundIds = getAdvancementTargetRoundIds(eventRounds, advancementCondition);
  const { advancingKeys, questionableKeys } = getFallbackAdvancement(
    round,
    advancementCondition,
    sourceRounds.map((sourceRound) => ({
      round: sourceRound,
      results: sourceRound.results.map((result) => ({
        ...result,
        key: String(result.personId),
        attempts: result.attempts.map(({ value }) => ({ result: value })),
      })),
    })),
    eventRounds
      .filter(({ id }) => targetRoundIds.includes(id))
      .flatMap(({ results }) => results.map(({ personId }) => ({ key: String(personId) }))),
  );

  return round.results.map((result) => {
    const resultWithRecords = result as typeof result & {
      regionalSingleRecord?: string | null;
      regionalAverageRecord?: string | null;
      singleRecordTag?: string | null;
      averageRecordTag?: string | null;
    };

    const advancing = result.ranking != null && advancingKeys.has(String(result.personId));
    return {
      id: result.personId,
      personId: result.personId,
      ranking: result.ranking,
      advancing,
      advancingQuestionable: advancing && questionableKeys.has(String(result.personId)),
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
