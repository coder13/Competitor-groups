import { eventNameById } from './events';
import { flatMap } from './utils';

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
export const byWorldRanking = (eventId) => (a, b) => {
  if (!eventId) {
    return 1;
  }

  const aPR = a.personalBests.find((i) => i.eventId.toString() === eventId.toString())?.best;
  const bPR = b.personalBests.find((i) => i.eventId.toString() === eventId.toString())?.best;
  if (aPR && bPR) {
    return aPR - bPR;
  } else {
    return (aPR ? 1 : 0) - (aPR ? 1 : 0);
  }
};
