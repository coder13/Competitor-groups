import { Competition, EventId, ParsedActivityCode, parseActivityCode } from '@wca/helpers';
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

export const parseActivityCodeFlexible = (
  activityCode: string
):
  | ParsedActivityCode
  | {
      eventId: string;
      roundNumber: 1;
      groupNumber: number;
      attemptNumber: null;
    } => {
  if (activityCode.startsWith('other')) {
    const regex = /other-(\w+)-g(\d+)/;
    const matches = activityCode.match(regex);
    const groupNumber = parseInt(matches![2], 10);
    return {
      eventId: `other-${matches![1]}`,
      roundNumber: 1,
      groupNumber,
      attemptNumber: null,
    };
  }

  return parseActivityCode(activityCode);
};

export const activityCodeToName = (activityCode) => {
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
