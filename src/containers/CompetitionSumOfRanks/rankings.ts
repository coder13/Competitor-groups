import { Competition, Person, Round } from '@wca/helpers';
import { WcaCompetitionResult } from '@/lib/api';
import { getEventName } from '@/lib/events';
import { getAllRoundsWithEvents, RoundWithEvent } from '@/lib/rounds';
import {
  findPersonForApiResult,
  getWcaApiResultsByRoundId,
} from '../CompetitionResults/resultSources';

export interface SumOfRanksRoundScore {
  roundId: string;
  eventId: string;
  eventName: string;
  roundNumber: number;
  ranking: number;
  kinch: number;
  medal: boolean;
  resultCount: number;
  missed: boolean;
}

export interface SumOfRanksPersonRanking {
  person: Person;
  position: number;
  sumOfRanks: number;
  kinch: number;
  medals: SumOfRanksRoundScore[];
  roundsCounted: number;
  missedRounds: number;
  scores: SumOfRanksRoundScore[];
}

interface RoundRanking {
  personId: number;
  ranking: number;
  best: number;
  average: number;
}

interface RoundWithRankings extends RoundWithEvent {
  rankings: RoundRanking[];
  winningResult: RoundRanking | undefined;
}

const hasAcceptedRegistration = (person: Person) =>
  !person.registration || person.registration.status === 'accepted';

const getStoredRoundRankings = (round: Round): RoundRanking[] =>
  round.results
    .map((result) =>
      result.ranking == null
        ? null
        : {
            personId: result.personId,
            ranking: result.ranking,
            best: result.best,
            average: result.average,
          },
    )
    .filter((result): result is RoundRanking => Boolean(result));

const getApiRoundRankings = (
  wcif: Competition,
  apiResultsByRoundId: Map<string, WcaCompetitionResult[]>,
  round: Round,
): RoundRanking[] =>
  (apiResultsByRoundId.get(round.id) ?? [])
    .map((result) => {
      const person = findPersonForApiResult(wcif.persons, result);

      if (!person || result.pos == null) {
        return null;
      }

      return {
        personId: person.registrantId,
        ranking: result.pos,
        best: result.best,
        average: result.average,
      };
    })
    .filter((result): result is RoundRanking => Boolean(result));

const getRoundRankings = (
  wcif: Competition,
  apiResultsByRoundId: Map<string, WcaCompetitionResult[]>,
  round: Round,
) => {
  const storedRankings = getStoredRoundRankings(round);

  if (storedRankings.length > 0) {
    return storedRankings;
  }

  return getApiRoundRankings(wcif, apiResultsByRoundId, round);
};

const getRoundsWithRankings = (
  wcif: Competition,
  wcaApiResults: WcaCompetitionResult[] | undefined,
): RoundWithRankings[] => {
  const apiResultsByRoundId = wcaApiResults?.length
    ? getWcaApiResultsByRoundId(wcif, wcaApiResults)
    : new Map<string, WcaCompetitionResult[]>();

  return getAllRoundsWithEvents(wcif)
    .map((roundWithEvent) => ({
      ...roundWithEvent,
      rankings: getRoundRankings(wcif, apiResultsByRoundId, roundWithEvent.round),
    }))
    .filter((roundWithEvent) => roundWithEvent.rankings.length > 0)
    .map((roundWithEvent) => ({
      ...roundWithEvent,
      winningResult: roundWithEvent.rankings.find((result) => result.ranking === 1),
    }));
};

const getPersonIdsWithResults = (rounds: RoundWithRankings[]) =>
  new Set(rounds.flatMap((round) => round.rankings.map((result) => result.personId)));

const getRankingResult = (round: Round, result: RoundRanking | undefined) => {
  if (!result) {
    return 0;
  }

  if (['1', '2', '3'].includes(round.format)) {
    return result.best;
  }

  return result.average;
};

const getKinch = (roundWithRankings: RoundWithRankings, result: RoundRanking | undefined) => {
  const winningResult = getRankingResult(roundWithRankings.round, roundWithRankings.winningResult);
  const rankingResult = getRankingResult(roundWithRankings.round, result);

  if (!winningResult || rankingResult <= 0) {
    return 0;
  }

  if (roundWithRankings.event.id === '333mbf') {
    return rankingResult / winningResult;
  }

  return winningResult / rankingResult;
};

const getScoreForRound = (
  person: Person,
  roundWithRankings: RoundWithRankings,
): SumOfRanksRoundScore => {
  const personResult = roundWithRankings.rankings.find(
    (result) => result.personId === person.registrantId,
  );
  const resultCount = roundWithRankings.rankings.length;

  return {
    roundId: roundWithRankings.round.id,
    eventId: roundWithRankings.event.id,
    eventName: getEventName(roundWithRankings.event.id, roundWithRankings.event),
    roundNumber: roundWithRankings.roundNumber,
    ranking: personResult?.ranking ?? resultCount + 1,
    kinch: getKinch(roundWithRankings, personResult),
    medal:
      roundWithRankings.roundNumber === roundWithRankings.event.rounds.length &&
      Boolean(personResult?.ranking && personResult.ranking <= 3),
    resultCount,
    missed: !personResult,
  };
};

const compareRankings = (a: SumOfRanksPersonRanking, b: SumOfRanksPersonRanking) => {
  const sumDiff = a.sumOfRanks - b.sumOfRanks;
  const missedDiff = a.missedRounds - b.missedRounds;

  if (sumDiff !== 0) {
    return sumDiff;
  }

  if (missedDiff !== 0) {
    return missedDiff;
  }

  return a.person.name.localeCompare(b.person.name);
};

export const getSumOfRanks = (
  wcif: Competition,
  wcaApiResults: WcaCompetitionResult[] | undefined,
): SumOfRanksPersonRanking[] => {
  const roundsWithRankings = getRoundsWithRankings(wcif, wcaApiResults);
  const personIdsWithResults = getPersonIdsWithResults(roundsWithRankings);

  return wcif.persons
    .filter(
      (person) => hasAcceptedRegistration(person) && personIdsWithResults.has(person.registrantId),
    )
    .map<SumOfRanksPersonRanking>((person) => {
      const scores = roundsWithRankings.map((roundWithRankings) =>
        getScoreForRound(person, roundWithRankings),
      );

      return {
        person,
        position: 0,
        sumOfRanks: scores.reduce((total, score) => total + score.ranking, 0),
        kinch: scores.reduce((total, score) => total + score.kinch, 0) / scores.length,
        medals: scores.filter((score) => score.medal),
        roundsCounted: scores.length,
        missedRounds: scores.filter((score) => score.missed).length,
        scores,
      };
    })
    .sort(compareRankings)
    .map((ranking, index) => ({
      ...ranking,
      position: index + 1,
    }));
};
