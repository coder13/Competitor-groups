import { eventNameById } from './events';
import { flatMap, shortTime } from './utils';

export const parseActivityCode = (activityCode) => {
  const [, e, r, g, a] = activityCode.match(/(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?/);
  return {
    eventId: e,
    roundNumber: r && parseInt(r, 10),
    groupNumber: g && parseInt(g, 10),
    attemptNumber: a && parseInt(a, 10),
  };
};

export const activityCodeToName = (activityCode) => {
  const { eventId, roundNumber, groupNumber, attemptNumber } = parseActivityCode(activityCode);
  return [
    eventId && eventNameById(eventId),
    roundNumber && `Round ${roundNumber}`,
    groupNumber && `Group ${groupNumber}`,
    attemptNumber && `Attempt ${attemptNumber}`,
  ]
    .filter((x) => x)
    .join(', ');
};

export const rooms = (wcif) => flatMap(wcif.schedule.venues, (venue) => venue.rooms);

// get all child activities by round
export const allChildActivities = (activity) =>
  activity.childActivities.length > 0
    ? [
        ...activity.childActivities.map((a) => ({
          ...a,
          parent: activity,
        })),
        ...flatMap(
          activity.childActivities.map((a) => ({
            ...a,
            parent: activity,
          })),
          allChildActivities
        ),
      ]
    : activity.childActivities.map((a) => ({
        ...a,
        parent: activity,
      }));

export const allActivities = (wcif) => {
  // Rounds
  const activities = flatMap(rooms(wcif), (room) =>
    room.activities.map((a) => ({
      ...a,
      room,
    }))
  );
  return [...activities, ...flatMap(activities, allChildActivities)];
};

export const allRoundActivities = (wcif) => {
  return flatMap(rooms(wcif), (room) =>
    room.activities.map((a) => ({
      ...a,
      room,
    }))
  );
};

export const roundActivities = (wcif, roundId) =>
  flatMap(rooms(wcif), (room) =>
    room.activities
      .filter(({ activityCode }) => activityCode.startsWith(roundId))
      .map((activity) => ({
        ...activity,
        room,
      }))
  );

export const groupActivitiesByRound = (wcif, roundId) =>
  flatMap(roundActivities(wcif, roundId), (roundActivity) =>
    hasDistributedAttempts(roundId)
      ? [roundActivity]
      : roundActivity.childActivities.map((activity) => ({
          ...activity,
          parent: roundActivity,
        }))
  );

export const hasDistributedAttempts = (activityCode) =>
  ['333fm', '333mbf'].includes(parseActivityCode(activityCode).eventId);

export const acceptedRegistration = ({ registration }) => registration?.status === 'accepted';
export const byName = (a, b) => a.name.localeCompare(b.name);
export const ByDate = (a, b) => new Date(a.startTime) - new Date(b.startTime);

const findPR = (eventId) => (personalBests, type) =>
  personalBests.find((pr) => pr.eventId.toString() === eventId.toString() && pr.type === type);

// const byRanking = (eventId) => {
//   const findEventPR = findPR(eventId);
//   return (result) => (a, b) =>
//     findEventPR(eventId)(b.personalBests, result).worldRanking -
//     findEventPR(eventId)(a.personalBests, result).worldRanking;
// };

export const byWorldRanking = (eventId) => {
  // const byEventRanking = byRanking(eventId);
  const findEventPR = findPR(eventId);

  return (a, b) => {
    const aPRAverage = findEventPR(a.personalBests, 'average');
    const bPRAverage = findEventPR(b.personalBests, 'average');

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

    const aPRSingle = findEventPR(a.personalBests, 'single');
    const bPRSingle = findEventPR(b.personalBests, 'single');

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

export const activityDurationString = ({ startTime, endTime }, timezone = 'UTC') =>
  `${shortTime(startTime, timezone)} - ${shortTime(endTime, timezone)}`;
