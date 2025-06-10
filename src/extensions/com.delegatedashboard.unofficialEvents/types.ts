import { Event, Round } from '@wca/helpers';

export interface UnofficialEvent {
  id: string;
  name: string;
  shortName?: string;
  rounds: Round[];
}

export interface UnofficialEventsExtensionData {
  events: UnofficialEvent[];
}

export type CompetitionEvent = UnofficialEvent | Event;
