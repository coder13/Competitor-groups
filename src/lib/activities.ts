import {
  Activity,
  Competition,
  EventId,
  Person,
  PersonalBest,
  RankingType,
  Room,
} from '@wca/helpers';
import flatten from 'lodash.flatten';
import flatMap from 'lodash.flatmap';
import { eventNameById, isRankedBySingle } from './events';
import { formatTime } from './utils';

const ActivityCodeRegExp = /(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/;

export const parseActivityCode = (activityCode: string) => {
  const [, e, r, g, a] = activityCode.match(ActivityCodeRegExp) || [];
  return {
    eventId: e,
    roundNumber: r ? parseInt(r, 10) : undefined,
    groupNumber: g ? parseInt(g, 10) : undefined,
    attemptNumber: a ? parseInt(a, 10) : undefined,
  } as {
    eventId: EventId;
    roundNumber?: number;
    groupNumber?: number;
    attemptNumber?: number;
  };
};

const isValidNumber = (n?: number) => typeof n === 'number' && !isNaN(n);

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

export const rooms = (wcif: Competition): Room[] =>
  flatten((wcif.schedule.venues || []).map((venue) => venue?.rooms || []));

export interface ActivityWithRoomOrParent extends Activity {
  room?: Room;
  parent?: ActivityWithRoomOrParent;
  childActivities: ActivityWithRoomOrParent[];
}

// get all child activities by round
// extends activity to include the activity's parent
export const allChildActivities = (activity: Activity): ActivityWithRoomOrParent[] => {
  if (!activity.childActivities || activity.childActivities.length === 0) {
    return [];
  }

  const childActivities = activity.childActivities.map((child) => ({
    ...child,
    parent: activity,
  }));

  return [...childActivities, ...flatMap(childActivities, allChildActivities)];
};

export const allActivities = (wcif: Competition): ActivityWithRoomOrParent[] => {
  // Rounds
  const activities = allRoundActivities(wcif);
  return [...activities, ...flatMap(activities, allChildActivities)];
};

/**
 * Returns a filtered list of all activities that represent a round
 * @param wcif
 * @returns
 */
export const allRoundActivities = (wcif: Competition): ActivityWithRoomOrParent[] => {
  return flatten(
    rooms(wcif).map((room) =>
      room.activities.map((a) => ({
        ...a,
        room,
      }))
    )
  );
};

/**
 * Returns a filtered list of round activities that match a roundId
 * @param wcif
 * @param roundId
 * @returns
 */
export const roundActivitiesForRoundId = (wcif: Competition, roundId: string) =>
  allRoundActivities(wcif).filter((a) => a.activityCode === roundId);

export const groupActivitiesByRound = (
  wcif: Competition,
  roundId: string
): ActivityWithRoomOrParent[] =>
  flatMap(roundActivitiesForRoundId(wcif, roundId), (roundActivity) =>
    hasDistributedAttempts(roundId)
      ? [roundActivity]
      : roundActivity.childActivities.map((activity) => ({
          ...activity,
          parent: roundActivity,
        }))
  );

export const hasDistributedAttempts = (activityCode: string): boolean =>
  ['333fm', '333mbf'].includes(parseActivityCode(activityCode).eventId);

export const acceptedRegistration = ({ registration }: Person): boolean =>
  registration?.status === 'accepted';

const findPR = (eventId: EventId) => (personalBests: PersonalBest[], type: RankingType) =>
  personalBests.find((pr) => pr.eventId.toString() === eventId.toString() && pr.type === type);

export const byWorldRanking = (eventId: EventId): ((a: Person, b: Person) => number) => {
  // const byEventRanking = byRanking(eventId);
  const findEventPR = findPR(eventId);

  return (a, b) => {
    if (!isRankedBySingle(eventId)) {
      const aPRAverage = findEventPR(a.personalBests || [], 'average');
      const bPRAverage = findEventPR(b.personalBests || [], 'average');

      if (aPRAverage && bPRAverage) {
        const diff = aPRAverage.worldRanking - bPRAverage.worldRanking;
        if (diff !== 0) {
          return diff;
        }
      } else if (aPRAverage && !bPRAverage) {
        return -1;
      } else if (!aPRAverage && bPRAverage) {
        return 1;
      }
    }

    const aPRSingle = findEventPR(a.personalBests || [], 'single');
    const bPRSingle = findEventPR(b.personalBests || [], 'single');

    if (aPRSingle && bPRSingle) {
      const diff = aPRSingle.worldRanking - bPRSingle.worldRanking;
      if (diff !== 0) {
        return diff;
      }
    } else if (aPRSingle && !bPRSingle) {
      return -1;
    } else if (!aPRSingle && bPRSingle) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  };
};

export const activityDurationString = (
  { startTime, endTime }: Activity,
  timeZone?: string
): string => `${formatTime(startTime, 5, timeZone)} - ${formatTime(endTime, 5, timeZone)}`;

export const streamPersonIds = (activity: ActivityWithRoomOrParent): number[] => {
  return (
    activity.extensions.find((ext) => ext.id === 'groupifier.ActivityConfig')?.data[
      'featuredCompetitorWcaUserIds'
    ] || []
  );
};

export const streamActivities = (wcif: Competition): ActivityWithRoomOrParent[] => {
  return allActivities(wcif).filter((activity) => streamPersonIds(activity).length > 0);
};

export const allUniqueActivityCodes = (wcif) => {
  const roundActivities = allRoundActivities(wcif);
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

export const getStationNumber =
  (assignmentCode: string, activity: Activity) => (person: Person) => {
    const assignment = person.assignments?.find(
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id
    );
    return assignment?.stationNumber;
  };
