import {
  Competition,
  EventId,
  ParsedActivityCode,
  parseActivityCode as wcaHelperParseActivityCode,
} from '@wca/helpers';
import { getAllRoundActivities } from './activities';
import { eventNameById } from './events';
import { isValidNumber } from './time';

export const allUniqueActivityCodes = (wcif) => {
  const roundActivities = getAllRoundActivities(wcif);
  const childActivities = roundActivities
    .flatMap((a) => a.childActivities)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const activityCodes = Array.from(new Set(childActivities.map((a) => a.activityCode)));
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

export const parseActivityCode = (activityCode: string): ParsedActivityCode => {
  if (activityCode.startsWith('other')) {
    return parseActivityCodeFlexible(activityCode) as ParsedActivityCode;
  }

  try {
    return wcaHelperParseActivityCode(activityCode);
  } catch (_) {
    console.error(new Error(`Invalid activity code: ${activityCode}`));

    return parseActivityCodeTryReallyHard(activityCode);
  }
};

const regex = /other-(?:(\w+))?(?:-g(\d+))?/;
export const parseActivityCodeFlexible = (
  activityCode: string
):
  | ParsedActivityCode
  | {
      eventId: string;
      roundNumber: 1;
      groupNumber: number | null;
      attemptNumber: null;
    } => {
  if (activityCode.startsWith('other')) {
    const [, e, g] = activityCode.match(regex) as string[];

    return {
      eventId: `other-${e}`,
      roundNumber: 1,
      groupNumber: g ? parseInt(g, 10) : null,
      attemptNumber: null,
    };
  }

  return parseActivityCode(activityCode);
};

export const parseActivityCodeTryReallyHard = (activityCode: string): ParsedActivityCode => {
  const trimmedInput = activityCode.trim();
  const parts = trimmedInput.split('-');
  const eventId = parts[0];
  const roundNumberPart = parts.find((part) => part.startsWith('r'))?.slice(1);
  const groupNumberPart = parts.find((part) => part.startsWith('g'))?.slice(1);
  const attemptNumberPart = parts.find((part) => part.startsWith('a'))?.slice(1);

  const roundNumber =
    roundNumberPart && !isNaN(+roundNumberPart) ? parseInt(roundNumberPart, 10) : null;
  const groupNumber =
    groupNumberPart && !isNaN(+groupNumberPart) ? parseInt(groupNumberPart, 10) : null;
  const attemptNumber =
    attemptNumberPart && !isNaN(+attemptNumberPart) ? parseInt(attemptNumberPart, 10) : null;

  return {
    eventId: eventId as EventId,
    roundNumber,
    groupNumber,
    attemptNumber,
  };
};

export const activityCodeToName = (activityCode: string) => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activityCode);
  return [
    eventId && eventNameById(eventId as EventId),
    isValidNumber(roundNumber) && `Round ${roundNumber}`,
    isValidNumber(groupNumber) && `Group ${groupNumber}`,
    isValidNumber(attemptNumber) && `Attempt ${attemptNumber}`,
  ]
    .filter((x) => x)
    .join(', ');
};
