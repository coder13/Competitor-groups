import {
  ParticipationResultCondition,
  ParticipationRuleset,
  ParticipationSource,
  ReservedPlaces,
  Round,
  parseActivityCode,
} from '@wca/helpers';

type LegacyAdvancementCondition = NonNullable<Round['advancementCondition']>;

export type ResultCondition = ParticipationResultCondition;

export interface RoundAdvancementCondition {
  sourceType: ParticipationSource['type'];
  sourceRoundIds: string[];
  targetRoundId?: string | null;
  resultCondition: ResultCondition;
  reservedPlaces?: ReservedPlaces | null;
}

export type CompatibleRound = Round;

const averagedFormats = new Set(['a', 'm', '5', 'h']);

const getRoundResultType = (round: Pick<Round, 'format'>): 'single' | 'average' =>
  averagedFormats.has(round.format) ? 'average' : 'single';

const getLegacyResultCondition = (
  advancementCondition: LegacyAdvancementCondition,
  sourceRound?: Round,
): ResultCondition => {
  switch (advancementCondition.type) {
    case 'ranking':
      return {
        type: 'ranking',
        value: advancementCondition.level,
      };
    case 'percent':
      return {
        type: 'percent',
        value: advancementCondition.level,
      };
    case 'attemptResult':
      return {
        type: 'resultAchieved',
        scope: sourceRound ? getRoundResultType(sourceRound) : 'single',
        value: advancementCondition.level,
      };
  }
};

const getPreviousRound = (eventRounds: Round[], round: Round): Round | undefined => {
  const { eventId, roundNumber } = parseActivityCode(round.id);

  if (!roundNumber || roundNumber <= 1) {
    return undefined;
  }

  return eventRounds.find((candidate) => candidate.id === `${eventId}-r${roundNumber - 1}`);
};

export const getRoundParticipationRuleset = (
  eventRounds: Round[],
  round: Round,
): ParticipationRuleset | null => {
  if (round.participationRuleset) {
    return round.participationRuleset;
  }

  if (!round.advancementCondition) {
    return null;
  }

  const previousRound = getPreviousRound(eventRounds, round);
  if (!previousRound) {
    return null;
  }

  return {
    participationSource: {
      type: 'round',
      roundId: previousRound.id,
      resultCondition: getLegacyResultCondition(round.advancementCondition, previousRound),
    },
  };
};

const getRoundParticipationSource = (
  eventRounds: Round[],
  round: Round,
): ParticipationSource | null =>
  getRoundParticipationRuleset(eventRounds, round)?.participationSource ?? null;

export const getAdvancementConditionForRound = (
  eventRounds: Round[],
  round: Round,
): RoundAdvancementCondition | null => {
  if (round.advancementCondition) {
    const { eventId, roundNumber } = parseActivityCode(round.id);
    const targetRoundId =
      roundNumber != null
        ? eventRounds.find((candidate) => candidate.id === `${eventId}-r${roundNumber + 1}`)?.id
        : null;

    return {
      sourceType: 'round',
      sourceRoundIds: [round.id],
      targetRoundId: targetRoundId ?? null,
      resultCondition: getLegacyResultCondition(round.advancementCondition, round),
      reservedPlaces: null,
    };
  }

  const { roundNumber } = parseActivityCode(round.id);
  const futureRounds = eventRounds.filter((candidate) => {
    const parsedCandidate = parseActivityCode(candidate.id);
    return (parsedCandidate.roundNumber ?? 0) > (roundNumber ?? 0);
  });

  const nextEligibleRound = futureRounds.find((candidate) => {
    const source = getRoundParticipationSource(eventRounds, candidate);

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

  const ruleset = getRoundParticipationRuleset(eventRounds, nextEligibleRound);
  const source = ruleset?.participationSource;

  if (!source || source.type === 'registrations') {
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
