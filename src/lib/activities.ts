import {
  Activity,
  Competition,
  EventId,
  Person,
  PersonalBest,
  RankingType,
  Room,
  Venue,
  parseActivityCode,
} from '@wca/helpers';
import { formatTime } from './time';
import { ActivityWithRoomOrParent, RoundActivity } from './types';

export const getVenues = (wcif: Competition) => wcif.schedule.venues;

export const getRooms = (
  wcif: Competition
): (Room & {
  venue: Venue;
})[] =>
  getVenues(wcif).flatMap((venue) =>
    venue.rooms.map((room) => ({
      ...room,
      venue,
    }))
  );

/**
 * Returns the activity's child activities with a reference to the parent activity
 */
export const getChildActivities = (roundActivity: Activity) => {
  return roundActivity.childActivities.map((child) => ({
    ...child,
    parent: roundActivity,
  }));
};

/**
 * returns the activity itself and all its child activities recursively
 */
export const getAllChildActivities = <T extends Activity>(activity: T): (T & { parent: T })[] => {
  if (!activity.childActivities || activity.childActivities.length === 0) {
    return [];
  }

  const childActivities = activity.childActivities.map((child) => ({
    ...child,
    parent: activity,
  })) as (T & { parent: T })[];

  const subChildActivities = childActivities.flatMap((a) => getAllChildActivities(a));

  return [...childActivities, ...subChildActivities];
};

/**
 * Returns a filtered list of all activities that represent a round
 * @param wcif
 * @returns
 */
export const getAllRoundActivities = (wcif: Competition): RoundActivity[] => {
  return getRooms(wcif).flatMap((room) =>
    room.activities.map((a) => ({
      ...a,
      room,
    }))
  );
};

/**
 * Returns a list of all activities in the competition including all child activities
 */
export const getAllActivities = (wcif: Competition): ActivityWithRoomOrParent[] => {
  // Rounds
  const activities = getAllRoundActivities(wcif);
  const childActivities = activities.flatMap(getAllChildActivities);

  return [...activities, ...childActivities];
};

export const getGroupActivities = (wcif: Competition) => {
  return getRooms(wcif)
    .flatMap((room) => [
      ...room.activities.map((a) => ({ ...a, room })),
      ...room.activities.flatMap((ra) =>
        ra.childActivities?.map((ca) => ({
          ...ca,
          parent: {
            ...ra,
            room,
          },
        }))
      ),
    ])
    .filter(Boolean) as ActivityWithRoomOrParent[];
};

/**
 * Returns a filtered list of round activities that match a roundId
 * @param wcif
 * @param roundId
 * @returns
 */
export const getRoundActivitiesForRoundId = (wcif: Competition, roundId: string) =>
  getAllRoundActivities(wcif).filter((a) => a.activityCode === roundId);

export const groupActivitiesByRound = (wcif: Competition, roundId: string) => {
  const roundActivities = getRoundActivitiesForRoundId(wcif, roundId);
  return roundActivities.flatMap((roundActivity) => {
    if (hasDistributedAttempts(roundId)) {
      return [{ ...roundActivity, room: roundActivity.room }];
    }

    return roundActivity.childActivities.map((activity) => ({
      ...activity,
      parent: roundActivity,
      room: roundActivity.room,
    }));
  });
};

export const hasDistributedAttempts = (activityCode: string): boolean =>
  ['333fm', '333mbf'].includes(parseActivityCode(activityCode).eventId);

export const findPR = (eventId: EventId) => (personalBests: PersonalBest[], type: RankingType) =>
  personalBests.find((pr) => pr.eventId.toString() === eventId.toString() && pr.type === type);

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
  return getAllActivities(wcif).filter((activity) => streamPersonIds(activity).length > 0);
};

export const getStationNumber =
  (assignmentCode: string, activity: Activity) => (person: Person) => {
    const assignment = person.assignments?.find(
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id
    );
    return assignment?.stationNumber;
  };
