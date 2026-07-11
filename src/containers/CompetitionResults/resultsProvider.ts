import { Competition, Person } from '@wca/helpers';
import { WcaLiveCompetitorResult, WcaLiveRound } from '@/hooks/queries/useWcaLive';
import { WcaCompetitionResult } from '@/lib/api';
import { getEventName } from '@/lib/events';
import { findRoundWithEvent } from '@/lib/rounds';
import { getAdvancementConditionForRound } from '@/lib/wcif';
import { PersonalRoundResult } from '../CompetitionPersonalResults/CompetitionPersonalResultsTable';
import { CompetitionRoundResult } from './CompetitionResultsTable';
import { normalizeResultRecordTag } from './ResultRecordBadge';
import { getStoredRoundResults } from './advancement';
import {
  findPersonForApiResult,
  findUniquePersonByName,
  getApiRoundResults,
  getWcaApiResultsByRoundId,
} from './resultSources';
import { getRoundRosterResults } from './roundRoster';

type SelectedRound = NonNullable<ReturnType<typeof findRoundWithEvent>>;

export interface EventResults {
  eventId: string;
  eventName: string;
  eventRank: number;
  rounds: PersonalRoundResult[];
}

const getResultKey = (result: CompetitionRoundResult) =>
  result.personId == null ? `result-${result.id}` : `person-${result.personId}`;

const mergeRoundResultSources = (
  ...sources: CompetitionRoundResult[][]
): CompetitionRoundResult[] => {
  const resultsByKey = new Map<string, CompetitionRoundResult>();

  sources.forEach((sourceResults) => {
    sourceResults.forEach((result) => {
      const key = getResultKey(result);
      const existingResult = resultsByKey.get(key);

      resultsByKey.set(key, {
        ...result,
        singleRecordTag: result.singleRecordTag ?? existingResult?.singleRecordTag,
        averageRecordTag: result.averageRecordTag ?? existingResult?.averageRecordTag,
      });
    });
  });

  return [...resultsByKey.values()];
};

const findPersonForLiveRoundResult = (
  wcif: Competition,
  result: WcaLiveRound['results'][number],
): Person | undefined => {
  if (result.person.registrantId != null) {
    const matchedByRegistrantId = wcif.persons.find(
      (person) => person.registrantId === result.person.registrantId,
    );

    if (matchedByRegistrantId) {
      return matchedByRegistrantId;
    }
  }

  if (result.person.wcaUserId != null) {
    const matchedByWcaUserId = wcif.persons.find(
      (person) => person.wcaUserId === result.person.wcaUserId,
    );

    if (matchedByWcaUserId) {
      return matchedByWcaUserId;
    }
  }

  if (result.person.wcaId) {
    const matchedByWcaId = wcif.persons.find((person) => person.wcaId === result.person.wcaId);

    if (matchedByWcaId) {
      return matchedByWcaId;
    }
  }

  const hasStrongIdentifier =
    result.person.registrantId != null ||
    result.person.wcaUserId != null ||
    Boolean(result.person.wcaId);

  return hasStrongIdentifier ? undefined : findUniquePersonByName(wcif.persons, result.person.name);
};

const getLiveRoundResults = (wcif: Competition, wcaLiveRound: WcaLiveRound | null | undefined) =>
  wcaLiveRound?.results
    .filter((result) => result.attempts.length > 0)
    .map<CompetitionRoundResult>((result) => {
      const matchedPerson = findPersonForLiveRoundResult(wcif, result);

      return {
        id: result.id,
        personId: matchedPerson?.registrantId ?? result.person.registrantId,
        personName: result.person.name,
        ranking: result.ranking,
        advancing: result.advancing,
        advancingQuestionable: result.advancingQuestionable,
        attempts: result.attempts,
        best: result.best,
        average: result.average,
        singleRecordTag: normalizeResultRecordTag(result.singleRecordTag),
        averageRecordTag: normalizeResultRecordTag(result.averageRecordTag),
      };
    }) ?? [];

export const getRoundResultsFromSources = ({
  wcif,
  selectedRound,
  wcaLiveRound,
  wcaApiResults,
}: {
  wcif: Competition | undefined;
  selectedRound: SelectedRound | undefined;
  wcaLiveRound: WcaLiveRound | null | undefined;
  wcaApiResults: WcaCompetitionResult[] | undefined;
}) => {
  if (!wcif || !selectedRound) {
    return [];
  }

  const liveRoundResults = getLiveRoundResults(wcif, wcaLiveRound);
  const storedRoundResults = getStoredRoundResults(
    selectedRound.round,
    getAdvancementConditionForRound(selectedRound.event.rounds, selectedRound.round),
  );
  const apiRoundResults = getApiRoundResults(wcif, selectedRound.round.id, wcaApiResults);

  if (liveRoundResults.length === 0) {
    return mergeRoundResultSources(apiRoundResults, storedRoundResults);
  }

  return mergeRoundResultSources(
    getRoundRosterResults(wcif, selectedRound.round.id),
    apiRoundResults,
    storedRoundResults,
    liveRoundResults,
  );
};

const getStoredPersonalResults = (wcif: Competition, person: Person): EventResults[] =>
  wcif.events
    .map((event, eventIndex) => {
      const rounds = event.rounds
        .map<PersonalRoundResult | undefined>((round, index) => {
          const result = round.results.find(
            (roundResult) => roundResult.personId === person.registrantId,
          );

          return result
            ? {
                roundId: round.id,
                roundNumber: index + 1,
                ranking: result.ranking,
                advancing: false,
                advancingQuestionable: false,
                attempts: result.attempts.map((attempt) => ({ result: attempt.result })),
                best: result.best,
                average: result.average,
              }
            : undefined;
        })
        .filter((roundResult): roundResult is PersonalRoundResult => Boolean(roundResult));

      return {
        eventId: event.id,
        eventName: getEventName(event.id, event),
        eventRank: eventIndex,
        rounds,
      };
    })
    .filter((eventResults) => eventResults.rounds.length > 0);

const getLivePersonalResults = (
  wcif: Competition,
  liveResults: WcaLiveCompetitorResult[],
): EventResults[] => {
  const liveResultsWithAttempts = liveResults.filter((result) => result.attempts.length > 0);
  const eventIds = Array.from(
    new Set(liveResultsWithAttempts.map((result) => result.round.competitionEvent.event.id)),
  );

  return eventIds
    .map((eventId) => {
      const eventResults = liveResultsWithAttempts.filter(
        (result) => result.round.competitionEvent.event.id === eventId,
      );
      const firstResult = eventResults[0];
      const wcifEvent = wcif.events.find((event) => event.id === eventId);

      return {
        eventId,
        eventName: wcifEvent
          ? getEventName(eventId, wcifEvent)
          : firstResult.round.competitionEvent.event.name,
        eventRank: wcifEvent
          ? wcif.events.indexOf(wcifEvent)
          : firstResult.round.competitionEvent.event.rank,
        rounds: eventResults
          .sort((a, b) => a.round.number - b.round.number)
          .map((result) => ({
            roundId:
              wcifEvent?.rounds[result.round.number - 1]?.id ??
              `${eventId}-r${result.round.number}`,
            roundName: result.round.name,
            roundNumber: result.round.number,
            ranking: result.ranking,
            advancing: result.advancing,
            advancingQuestionable: result.advancingQuestionable,
            attempts: result.attempts,
            best: result.best,
            average: result.average,
          })),
      };
    })
    .sort((a, b) => a.eventRank - b.eventRank);
};

const getApiPersonalResults = (
  wcif: Competition,
  person: Person,
  apiResults: WcaCompetitionResult[],
): EventResults[] => {
  const personResults = apiResults.filter(
    (result) => findPersonForApiResult(wcif.persons, result)?.registrantId === person.registrantId,
  );
  const resultsByRoundId = getWcaApiResultsByRoundId(wcif, personResults);

  return wcif.events
    .map((event, eventIndex) => {
      const rounds = event.rounds
        .map<PersonalRoundResult | undefined>((round, roundIndex) => {
          const result = resultsByRoundId.get(round.id)?.[0];

          return result
            ? {
                roundId: round.id,
                roundNumber: roundIndex + 1,
                ranking: result.pos,
                advancing: false,
                advancingQuestionable: false,
                attempts: result.attempts.map((attempt) => ({ result: attempt })),
                best: result.best,
                average: result.average,
              }
            : undefined;
        })
        .filter((roundResult): roundResult is PersonalRoundResult => Boolean(roundResult));

      return {
        eventId: event.id,
        eventName: getEventName(event.id, event),
        eventRank: eventIndex,
        rounds,
      };
    })
    .filter((eventResults) => eventResults.rounds.length > 0);
};

const mergeEventResultSources = (...sources: EventResults[][]): EventResults[] => {
  const eventsById = new Map<string, EventResults>();

  sources.forEach((sourceEvents) => {
    sourceEvents.forEach((sourceEvent) => {
      const existingEvent = eventsById.get(sourceEvent.eventId);
      const roundsById = new Map(
        existingEvent?.rounds.map((roundResult) => [roundResult.roundId, roundResult]) ?? [],
      );

      sourceEvent.rounds.forEach((roundResult) => {
        const existingRoundResult = roundsById.get(roundResult.roundId);

        roundsById.set(roundResult.roundId, {
          ...existingRoundResult,
          ...roundResult,
        });
      });

      eventsById.set(sourceEvent.eventId, {
        ...existingEvent,
        ...sourceEvent,
        eventName: existingEvent?.eventName ?? sourceEvent.eventName,
        eventRank: existingEvent?.eventRank ?? sourceEvent.eventRank,
        rounds: [...roundsById.values()].sort((a, b) => a.roundNumber - b.roundNumber),
      });
    });
  });

  return [...eventsById.values()].sort((a, b) => a.eventRank - b.eventRank);
};

export const getPersonalResultsFromSources = ({
  wcif,
  person,
  wcaLiveResults,
  wcaApiResults,
}: {
  wcif: Competition | undefined;
  person: Person;
  wcaLiveResults: WcaLiveCompetitorResult[] | undefined;
  wcaApiResults: WcaCompetitionResult[] | undefined;
}) => {
  if (!wcif) {
    return [];
  }

  return mergeEventResultSources(
    wcaApiResults?.length ? getApiPersonalResults(wcif, person, wcaApiResults) : [],
    getStoredPersonalResults(wcif, person),
    wcaLiveResults?.length ? getLivePersonalResults(wcif, wcaLiveResults) : [],
  );
};
