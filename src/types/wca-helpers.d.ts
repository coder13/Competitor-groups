import '@wca/helpers';

declare module '@wca/helpers' {
  export type ParticipationResultCondition =
    | {
        type: 'ranking' | 'percent';
        value: number;
      }
    | {
        type: 'resultAchieved';
        scope: 'single' | 'average';
        value: number | null;
      };

  export type ParticipationSource =
    | {
        type: 'registrations';
      }
    | {
        type: 'round';
        roundId: string;
        resultCondition: ParticipationResultCondition;
      }
    | {
        type: 'linkedRounds';
        roundIds: string[];
        resultCondition: ParticipationResultCondition;
      };

  export interface ReservedPlaces {
    nationalities: string[];
    count?: number;
    reservations?: number;
  }

  export interface ParticipationRuleset {
    participationSource: ParticipationSource;
    reservedPlaces?: ReservedPlaces | null;
  }

  export interface Round {
    participationRuleset?: ParticipationRuleset | null;
  }
}
