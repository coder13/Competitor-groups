import { CompetitionEvent, UnofficialEvent } from './types';

export const isUnofficialEvent = (event: CompetitionEvent): event is UnofficialEvent => {
  return 'name' in event && typeof event.name === 'string';
};
