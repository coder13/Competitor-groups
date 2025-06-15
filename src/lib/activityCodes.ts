import { ActivityCode, Competition, parseActivityCode, ParsedActivityCode } from '@wca/helpers';
import { CompetitionEvent } from '@/extensions/com.delegatedashboard.unofficialEvents';
import i18n from '@/i18n';
import { getAllRoundActivities } from './activities';
import { getEventName, isOfficialEventId } from './events';
import { isValidNumber } from './time';

export const allUniqueActivityCodes = (wcif) => {
  const roundActivities = getAllRoundActivities(wcif);
  const childActivities = roundActivities
    .flatMap((a) => a.childActivities)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const activityCodes = Array.from(
    new Set(childActivities.map((a) => normalizeActivityCode(a.activityCode))),
  );
  return activityCodes;
};

export const prevActivityCode = (wcif: Competition, activityCode: string) => {
  const activityCodes = allUniqueActivityCodes(wcif);
  const index = activityCodes.findIndex((a) => a === activityCode);
  return activityCodes?.[index - 1];
};

export const nextActivityCode = (wcif: Competition, activityCode: string) => {
  const activityCodes = allUniqueActivityCodes(wcif);
  const index = activityCodes.findIndex((a) => a === activityCode);
  return activityCodes?.[index + 1];
};

export type UnofficialParsedActivityCode = {
  rawEventId: string;
  eventId: string;
  roundNumber: number | null;
  groupNumber: number | null;
  attemptNumber: number | null;
};

export const isUnofficialParsedActivityCode = (
  parsed: ParsedActivityCode | UnofficialParsedActivityCode,
): parsed is UnofficialParsedActivityCode => {
  return (
    'rawEventId' in parsed &&
    'eventId' in parsed &&
    'roundNumber' in parsed &&
    'groupNumber' in parsed &&
    'attemptNumber' in parsed
  );
};

export const parseActivityCodeFlexible = (
  activityCode: string,
): ParsedActivityCode | UnofficialParsedActivityCode => {
  const eventId = activityCode.split('-')[0];
  if (activityCode.startsWith('other') || !isOfficialEventId(eventId)) {
    return parseUnofficialActivityCode(activityCode);
  }

  return parseActivityCode(activityCode);
};

const normalizeEventId = (eventId: string): string =>
  eventId.replace('other-', '').replace('unofficial-', '');

export const parseUnofficialActivityCode = (activityCode: string): UnofficialParsedActivityCode => {
  const regex = /^([\w-]+?)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?$/;
  const matches = activityCode.match(regex);
  if (!matches) {
    throw new Error(`Invalid activity code: ${activityCode}`);
  }

  const [_, e, r, g, a] = matches;

  return {
    rawEventId: e,
    eventId: normalizeEventId(e),
    roundNumber: r ? parseInt(r, 10) : null,
    groupNumber: g ? parseInt(g, 10) : null,
    attemptNumber: a ? parseInt(a, 10) : null,
  };
};

export const activityCodeToName = (activityCode: string, event?: CompetitionEvent) => {
  const { eventId, roundNumber, groupNumber, attemptNumber } =
    parseActivityCodeFlexible(activityCode);
  return [
    eventId && getEventName(eventId, event),
    isValidNumber(roundNumber) && i18n.t('common.activityCodeToName.round', { roundNumber }),
    isValidNumber(groupNumber) && i18n.t('common.activityCodeToName.group', { groupNumber }),
    isValidNumber(attemptNumber) && i18n.t('common.activityCodeToName.attempt', { attemptNumber }),
  ]
    .filter((x) => x)
    .join(', ');
};

export const toRoundId = (activityCode: ActivityCode | string): string => {
  const parsedActivityCode = parseActivityCodeFlexible(activityCode);
  const { eventId, roundNumber } = parsedActivityCode;

  const normalizedEventId = eventId.replace('other-', '').replace('unofficial-', '');

  return `${normalizedEventId}-r${roundNumber}`;
};

export const toRoundAttemptId = (activityCode: ActivityCode | string): string => {
  const parsedActivityCode = parseActivityCodeFlexible(activityCode);
  const { eventId, roundNumber, attemptNumber } = parsedActivityCode;

  const normalizedEventId = eventId.replace('other-', '').replace('unofficial-', '');

  return `${normalizedEventId}-r${roundNumber}${attemptNumber ? `-a${attemptNumber}` : ''}`;
};

export const normalizeActivityCode = (activityCode: ActivityCode | string): string => {
  const { eventId, roundNumber, groupNumber, attemptNumber } =
    parseActivityCodeFlexible(activityCode);
  return [
    eventId,
    isValidNumber(roundNumber) ? `r${roundNumber}` : '',
    isValidNumber(groupNumber) ? `g${groupNumber}` : '',
    isValidNumber(attemptNumber) ? `a${attemptNumber}` : '',
  ]
    .filter(Boolean)
    .join('-');
};

export const matchesActivityCode = (a: ActivityCode | string) => (b: ActivityCode | string) => {
  return normalizeActivityCode(a) === normalizeActivityCode(b);
};
