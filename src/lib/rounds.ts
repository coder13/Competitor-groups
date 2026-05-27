import { Competition, Round } from '@wca/helpers';
import { CompetitionEvent } from '@/extensions/com.delegatedashboard.unofficialEvents';
import { getAllEvents } from './events';

export interface RoundWithEvent {
  event: CompetitionEvent;
  round: Round;
  roundNumber: number;
}

export const getAllRoundsWithEvents = (wcif: Competition): RoundWithEvent[] =>
  getAllEvents(wcif).flatMap((event) =>
    event.rounds.map((round, index) => ({
      event,
      round,
      roundNumber: index + 1,
    })),
  );

export const findRoundWithEvent = (wcif: Competition, roundId: string) =>
  getAllRoundsWithEvents(wcif).find(({ round }) => round.id === roundId);
