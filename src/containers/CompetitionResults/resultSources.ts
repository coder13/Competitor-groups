import { Competition, Person } from '@wca/helpers';
import { WcaCompetitionResult } from '@/lib/api';
import { CompetitionRoundResult } from './CompetitionResultsTable';

const roundTypeOrder = ['0', '1', 'c', '2', 'e', '3', 'b', 'd', 'f'];

const compareRoundTypeIds = (a: string, b: string) => {
  const aIndex = roundTypeOrder.indexOf(a);
  const bIndex = roundTypeOrder.indexOf(b);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  }

  if (aIndex !== -1) {
    return -1;
  }

  if (bIndex !== -1) {
    return 1;
  }

  return a.localeCompare(b);
};

export const findPersonForApiResult = (persons: Person[], result: WcaCompetitionResult) =>
  persons.find(
    (person) =>
      (result.wca_id && person.wcaId === result.wca_id) ||
      person.name.toLocaleLowerCase() === result.name.toLocaleLowerCase(),
  );

export const getWcaApiRoundTypeMap = (results: WcaCompetitionResult[]) => {
  const roundTypeIdsByEventId = new Map<string, string[]>();

  results.forEach((result) => {
    const existingRoundTypeIds = roundTypeIdsByEventId.get(result.event_id) ?? [];

    if (!existingRoundTypeIds.includes(result.round_type_id)) {
      roundTypeIdsByEventId.set(result.event_id, [...existingRoundTypeIds, result.round_type_id]);
    }
  });

  roundTypeIdsByEventId.forEach((roundTypeIds, eventId) => {
    roundTypeIdsByEventId.set(eventId, [...roundTypeIds].sort(compareRoundTypeIds));
  });

  return roundTypeIdsByEventId;
};

const getRoundIdForApiResult = (
  wcif: Competition,
  roundTypeIdsByEventId: Map<string, string[]>,
  result: WcaCompetitionResult,
) => {
  const event = wcif.events.find((candidate) => candidate.id === result.event_id);
  const roundTypeIds = roundTypeIdsByEventId.get(result.event_id) ?? [];
  const numericRoundNumber = Number(result.round_type_id);

  if (event && Number.isInteger(numericRoundNumber) && numericRoundNumber > 0) {
    return event.rounds[numericRoundNumber - 1]?.id ?? `${result.event_id}-r${numericRoundNumber}`;
  }

  if (event && result.round_type_id === 'f') {
    return event.rounds.at(-1)?.id ?? `${result.event_id}-r${event.rounds.length}`;
  }

  const roundTypeIndex = roundTypeIds.indexOf(result.round_type_id);

  return event?.rounds[roundTypeIndex]?.id ?? `${result.event_id}-r${roundTypeIndex + 1}`;
};

export const getWcaApiResultsByRoundId = (wcif: Competition, results: WcaCompetitionResult[]) => {
  const roundTypeIdsByEventId = getWcaApiRoundTypeMap(results);

  return results.reduce<Map<string, WcaCompetitionResult[]>>((resultsByRoundId, result) => {
    const roundId = getRoundIdForApiResult(wcif, roundTypeIdsByEventId, result);
    const existingResults = resultsByRoundId.get(roundId) ?? [];

    resultsByRoundId.set(roundId, [...existingResults, result]);
    return resultsByRoundId;
  }, new Map());
};

export const toCompetitionRoundResult = (
  persons: Person[],
  result: WcaCompetitionResult,
): CompetitionRoundResult => {
  const person = findPersonForApiResult(persons, result);

  return {
    id: result.id,
    personId: person?.registrantId ?? null,
    personName: result.name,
    ranking: result.pos,
    advancing: false,
    advancingQuestionable: false,
    attempts: result.attempts.map((attempt) => ({ result: attempt })),
    best: result.best,
    average: result.average,
  };
};

export const getApiRoundResults = (
  wcif: Competition | undefined,
  roundId: string | undefined,
  results: WcaCompetitionResult[] | undefined,
) => {
  if (!wcif || !roundId || !results?.length) {
    return [];
  }

  const resultsByRoundId = getWcaApiResultsByRoundId(wcif, results);

  return (resultsByRoundId.get(roundId) ?? []).map((result) =>
    toCompetitionRoundResult(wcif.persons, result),
  );
};
