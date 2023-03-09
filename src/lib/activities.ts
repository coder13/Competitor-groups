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
import { eventNameById } from './events';
import { formatTime } from './utils';

const ActivityCodeRegExp = /(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/;

export const parseActivityCode = (activityCode: string) => {
  const [, e, r, g, a] = activityCode.match(ActivityCodeRegExp) || [];
  return {
    eventId: e,
    roundNumber: r ? parseInt(r, 10) : undefined,
    groupNumber: g ? parseInt(g, 10) : undefined,
    attemptNumber: a ? parseInt(a, 10) : undefined,
  };
};

export const activityCodeToName = (activityCode) => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activityCode);
  return [
    eventId && eventNameById(eventId as EventId),
    roundNumber && `Round ${roundNumber}`,
    groupNumber && `Group ${groupNumber}`,
    attemptNumber && `Attempt ${attemptNumber}`,
  ]
    .filter((x) => x)
    .join(', ');
};

export const rooms = (wcif: Competition): Room[] =>
  flatten((wcif.schedule.venues || []).map((venue) => venue?.rooms || []));

interface ActivityWithRoomOrParent extends Activity {
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

export const queryMatch = (person: Person, query: string): boolean => {
  return query === '' || person.name.toLocaleLowerCase().includes(query.toLocaleLowerCase());
};

const findPR = (eventId: EventId) => (personalBests: PersonalBest[], type: RankingType) =>
  personalBests.find((pr) => pr.eventId.toString() === eventId.toString() && pr.type === type);

export const byWorldRanking = (eventId: EventId): ((a: Person, b: Person) => number) => {
  // const byEventRanking = byRanking(eventId);
  const findEventPR = findPR(eventId);

  return (a, b) => {
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

export const activityDurationString = ({ startTime, endTime }: Activity): string =>
  `${formatTime(startTime, 5)} - ${formatTime(endTime, 5)}`;
