import { EventId, RankingType, AttemptResult } from '@wca/helpers';
import { WcaCompetitionResult } from '@/lib/api';
import { getEventName, isOfficialEventId, isRankedBySingle } from '@/lib/events';
import { renderCentiseconds, renderResultByEventId } from '@/lib/results';

export type UserPageTab = 'competitions' | 'results' | 'records';

export interface WcaPersonalRecord {
  id?: number;
  person_id?: string;
  event_id?: string;
  best: number;
  world_rank: number;
  continent_rank: number;
  country_rank: number;
}

export type WcaPersonalRecords = Record<
  string,
  {
    single?: WcaPersonalRecord;
    average?: WcaPersonalRecord;
  }
>;

export interface WcaPersonResponse {
  person: {
    country_iso2?: string;
    personal_records?: WcaPersonalRecords;
  };
  personal_records?: WcaPersonalRecords;
}

export const getPersonalRecords = (profile: WcaPersonResponse | undefined) =>
  profile?.personal_records || profile?.person.personal_records || {};

export const getPersonResultsPath = (competitionId: string, wcaId: string | undefined) =>
  wcaId ? `/competitions/${competitionId}/persons/wca/${wcaId}/results` : undefined;

export interface CompetitionResultSummary {
  competitionId: string;
  roundCount: number;
  eventCount: number;
  bestResult: WcaCompetitionResult;
}

export interface EventResultSummary {
  eventId: string;
  eventName: string;
  roundCount: number;
  competitionCount: number;
  bestSingle: number;
  bestAverage: number;
}

export interface HistoricalPrFlags {
  single: boolean;
  average: boolean;
}

const roundTypeLabels: Record<string, string> = {
  '0': 'Qualification round',
  '1': 'First round',
  '2': 'Second round',
  '3': 'Third round',
  b: 'B Final',
  c: 'Combined round',
  d: 'Combined first round',
  e: 'Combined second round',
  f: 'Final',
};

const resultValue = (result: WcaCompetitionResult) =>
  result.average > 0 && !isRankedBySingle(result.event_id as EventId)
    ? result.average
    : result.best;

const compareResults = (a: WcaCompetitionResult, b: WcaCompetitionResult) => {
  if (a.event_id === '333mbf' && b.event_id === '333mbf') {
    return b.best - a.best;
  }

  return resultValue(a) - resultValue(b);
};

const compareAttemptResults = (eventId: string, a: number, b: number) => {
  if (eventId === '333mbf') {
    return b - a;
  }

  return a - b;
};

export const formatUserResult = (
  eventId: string,
  rankingType: RankingType,
  value: number | undefined,
) => {
  if (!value || value <= 0) {
    return '-';
  }

  if (isOfficialEventId(eventId)) {
    return renderResultByEventId(eventId, rankingType, value as AttemptResult);
  }

  return eventId === '333fm' && rankingType === 'average'
    ? (value / 100).toFixed(2)
    : renderCentiseconds(value);
};

export const getUserEventName = (eventId: string) =>
  isOfficialEventId(eventId) ? getEventName(eventId) : eventId.toUpperCase();

export const getRoundTypeName = (roundTypeId: string) =>
  roundTypeLabels[roundTypeId] ?? roundTypeId.toUpperCase();

export const compareUserResultsByNewest = (a: WcaCompetitionResult, b: WcaCompetitionResult) =>
  b.competition_id.localeCompare(a.competition_id) ||
  a.round_type_id.localeCompare(b.round_type_id);

const compareUserResultsByOldest = (a: WcaCompetitionResult, b: WcaCompetitionResult) =>
  a.competition_id.localeCompare(b.competition_id) ||
  a.round_type_id.localeCompare(b.round_type_id);

export const getHistoricalPrFlags = (
  results: WcaCompetitionResult[],
): Record<number, HistoricalPrFlags> => {
  let bestSingle = 0;
  let bestAverage = 0;

  return [...results]
    .sort(compareUserResultsByOldest)
    .reduce<Record<number, HistoricalPrFlags>>((acc, result) => {
      const isSinglePr =
        result.best > 0 &&
        (!bestSingle || compareAttemptResults(result.event_id, result.best, bestSingle) < 0);
      const isAveragePr =
        result.average > 0 &&
        (!bestAverage || compareAttemptResults(result.event_id, result.average, bestAverage) < 0);

      if (isSinglePr) {
        bestSingle = result.best;
      }

      if (isAveragePr) {
        bestAverage = result.average;
      }

      acc[result.id] = {
        single: isSinglePr,
        average: isAveragePr,
      };

      return acc;
    }, {});
};

export const getCompetitionResultSummaries = (
  results: WcaCompetitionResult[],
): CompetitionResultSummary[] => {
  const summariesByCompetition = new Map<
    string,
    {
      roundCount: number;
      eventIds: Set<string>;
      bestResult: WcaCompetitionResult;
    }
  >();

  results.forEach((result) => {
    const existing = summariesByCompetition.get(result.competition_id);

    if (!existing) {
      summariesByCompetition.set(result.competition_id, {
        roundCount: 1,
        eventIds: new Set([result.event_id]),
        bestResult: result,
      });
      return;
    }

    existing.roundCount += 1;
    existing.eventIds.add(result.event_id);

    if (compareResults(result, existing.bestResult) < 0) {
      existing.bestResult = result;
    }
  });

  return Array.from(summariesByCompetition.entries())
    .map(([competitionId, summary]) => ({
      competitionId,
      roundCount: summary.roundCount,
      eventCount: summary.eventIds.size,
      bestResult: summary.bestResult,
    }))
    .sort((a, b) => a.competitionId.localeCompare(b.competitionId));
};

export const getEventResultSummaries = (results: WcaCompetitionResult[]): EventResultSummary[] => {
  const summariesByEvent = new Map<
    string,
    {
      roundCount: number;
      competitionIds: Set<string>;
      bestSingle: number;
      bestAverage: number;
    }
  >();

  results.forEach((result) => {
    const existing = summariesByEvent.get(result.event_id);

    if (!existing) {
      summariesByEvent.set(result.event_id, {
        roundCount: 1,
        competitionIds: new Set([result.competition_id]),
        bestSingle: result.best,
        bestAverage: result.average,
      });
      return;
    }

    existing.roundCount += 1;
    existing.competitionIds.add(result.competition_id);

    if (
      result.best > 0 &&
      (!existing.bestSingle ||
        compareAttemptResults(result.event_id, result.best, existing.bestSingle) < 0)
    ) {
      existing.bestSingle = result.best;
    }

    if (
      result.average > 0 &&
      (!existing.bestAverage ||
        compareAttemptResults(result.event_id, result.average, existing.bestAverage) < 0)
    ) {
      existing.bestAverage = result.average;
    }
  });

  return Array.from(summariesByEvent.entries())
    .map(([eventId, summary]) => ({
      eventId,
      eventName: getUserEventName(eventId),
      roundCount: summary.roundCount,
      competitionCount: summary.competitionIds.size,
      bestSingle: summary.bestSingle,
      bestAverage: summary.bestAverage,
    }))
    .sort((a, b) => a.eventName.localeCompare(b.eventName));
};
