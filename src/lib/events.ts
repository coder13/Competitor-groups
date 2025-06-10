import { Competition, EventId, Round } from '@wca/helpers';
import {
  CompetitionEvent,
  getUnofficialEventsExtension,
  isUnofficialEvent,
} from '@/extensions/com.delegatedashboard.unofficialEvents';
import i18n from '@/i18n';

export const events: {
  id: EventId;
  name: string;
  shortName: string;
}[] = [
  { id: '333', name: '3x3x3 Cube', shortName: '3x3' },
  { id: '222', name: '2x2x2 Cube', shortName: '2x2' },
  { id: '444', name: '4x4x4 Cube', shortName: '4x4' },
  { id: '555', name: '5x5x5 Cube', shortName: '5x5' },
  { id: '666', name: '6x6x6 Cube', shortName: '6x6' },
  { id: '777', name: '7x7x7 Cube', shortName: '7x7' },
  { id: '333bf', name: '3x3x3 Blindfolded', shortName: '3BLD' },
  { id: '333fm', name: '3x3x3 Fewest Moves', shortName: 'FMC' },
  { id: '333oh', name: '3x3x3 One-Handed', shortName: '3OH' },
  { id: 'minx', name: 'Megaminx', shortName: 'Minx' },
  { id: 'pyram', name: 'Pyraminx', shortName: 'Pyra' },
  { id: 'clock', name: 'Clock', shortName: 'Clock' },
  { id: 'skewb', name: 'Skewb', shortName: 'Skewb' },
  { id: 'sq1', name: 'Square-1', shortName: 'Sq1' },
  { id: '444bf', name: '4x4x4 Blindfolded', shortName: '4BLD' },
  { id: '555bf', name: '5x5x5 Blindfolded', shortName: '5BLD' },
  { id: '333mbf', name: '3x3x3 Multi-Blind', shortName: 'MBLD' },
];

export const isRankedBySingle = (eventId: EventId) =>
  ['333bf', '444bf', '555bf', '333mbf'].includes(eventId);

export const eventNameById = (eventId: EventId) => {
  if (eventId.startsWith('other') || !events.find((event) => event.id === eventId)) {
    return eventId;
  }

  return i18n.t(`common.wca.events.${eventId}`, {
    fallbackLng: 'en',
  });
};

export const shortEventNameById = (eventId: EventId | string, name?: string) =>
  eventId.startsWith('other') ? name : propertyById('shortName', eventId as EventId) || eventId;

const propertyById = (property: string, eventId: EventId) =>
  events.find((event) => event.id === eventId)?.[property];

export const getAllEvents = (wcif: Competition): CompetitionEvent[] => {
  const events = wcif.events;

  const unofficialEvents = getUnofficialEventsExtension(wcif.extensions).events;

  return [...events, ...unofficialEvents];
};

export const getAllRounds = (wcif: Competition): Round[] => {
  const events = getAllEvents(wcif);

  return events.flatMap((event) => event.rounds);
};

export const getEventName = (eventId: string | EventId, event?: CompetitionEvent) => {
  if (isOfficialEventId(eventId)) {
    return i18n.t(`common.wca.events.${eventId}`);
  }

  if (event && isUnofficialEvent(event)) {
    return event.name;
  }
  return eventId.toUpperCase();
};

export const getEventShortName = (event: CompetitionEvent) => {
  if (isUnofficialEvent(event)) {
    return event.shortName || event.name;
  }

  return events[event.id].shortName;
};

export const isOfficialEventId = (eventId: string | EventId): eventId is EventId =>
  [
    '333',
    '222',
    '444',
    '555',
    '666',
    '777',
    '333bf',
    '333fm',
    '333oh',
    'minx',
    'pyram',
    'clock',
    'skewb',
    'sq1',
    '444bf',
    '555bf',
    '333mbf',
  ].includes(eventId);
