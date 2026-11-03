import {
  ParticipationSource,
  ReservedPlaces,
  ResultCondition,
  Round,
  parseActivityCode,
} from '@wca/helpers';

export interface RoundAdvancementCondition {
  sourceType: ParticipationSource['type'];
  sourceRoundIds: string[];
  targetRoundId?: string | null;
  resultCondition: ResultCondition;
  reservedPlaces?: ReservedPlaces | null;
}

export const getAdvancementConditionForRound = (
  eventRounds: Round[],
  round: Round,
): RoundAdvancementCondition | null => {
  const { roundNumber } = parseActivityCode(round.id);
  const futureRounds = eventRounds.filter((candidate) => {
    const parsedCandidate = parseActivityCode(candidate.id);
    return (parsedCandidate.roundNumber ?? 0) > (roundNumber ?? 0);
  });

  const nextEligibleRound = futureRounds.find((candidate) => {
    const source = candidate.participationRuleset?.participationSource;

    if (!source || source.type === 'registrations') {
      return false;
    }

    if (source.type === 'round') {
      return source.roundId === round.id;
    }

    return source.roundIds.includes(round.id);
  });

  if (!nextEligibleRound) {
    return null;
  }

  const ruleset = nextEligibleRound.participationRuleset;
  const source = ruleset?.participationSource;

  if (!source || source.type === 'registrations' || !source.resultCondition) {
    return null;
  }

  return {
    sourceType: source.type,
    sourceRoundIds: source.type === 'round' ? [source.roundId] : source.roundIds,
    targetRoundId: nextEligibleRound.id,
    resultCondition: source.resultCondition,
    reservedPlaces: ruleset?.reservedPlaces ?? null,
  };
};
