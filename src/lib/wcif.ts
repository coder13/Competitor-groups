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

/** Explicit WCIF links also describe dual finals, which have no advancement rules. */
export const getLinkedRoundIds = (eventRounds: Round[], round: Round): string[] => {
  const linkedIds =
    round.linkedRounds ??
    eventRounds.find((candidate) => candidate.linkedRounds?.includes(round.id))?.linkedRounds ??
    eventRounds.flatMap((candidate) => {
      const source = candidate.participationRuleset?.participationSource;
      return source?.type === 'linkedRounds' && source.roundIds.includes(round.id)
        ? source.roundIds
        : [];
    });
  const ids = new Set(linkedIds);
  if (ids.size === 0) return [];
  ids.add(round.id);
  return eventRounds.filter((candidate) => ids.has(candidate.id)).map((candidate) => candidate.id);
};
