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
import {
  getNatsHelperGroupExtension,
  getNatsHelperRoomExtension,
} from '../extensions/org.cubingusa.natshelper.v1';
import { formatTime, formatToParts, getNumericDateFormatter } from './time';
import { ActivityWithRoomOrParent, RoundActivity } from './types';
import { byDate, unique } from './utils';

export const getVenues = (wcif: Competition) => wcif.schedule.venues;

export const getRooms = (
  wcif: Competition,
): (Room & {
  venue: Venue;
})[] =>
  getVenues(wcif).flatMap((venue) =>
    venue.rooms.map((room) => ({
      ...room,
      venue,
    })),
  );

/**
 * Returns the activity's child activities with a reference to the parent activity
 */
export const getChildActivities = (roundActivity): ActivityWithRoomOrParent[] => {
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
    })),
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
        })),
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
  timeZone?: string,
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
      (a) => a.assignmentCode === assignmentCode && a.activityId === activity.id,
    );
    return assignment?.stationNumber;
  };

export const isActivityInRoom = (room: Room) => {
  const roundActivities = room.activities;
  const childActivities = roundActivities.flatMap(getAllChildActivities);

  return (activity: Activity) => {
    return () => {
      return (
        roundActivities.some((a) => a.id === activity.id) ||
        childActivities.some((a) => a.id === activity.id)
      );
    };
  };
};

export const getVenueForActivity = (wcif: Competition) => {
  const venueActivityMap: Record<number, Venue> = getVenues(wcif).reduce((acc, venue) => {
    venue.rooms.forEach((room) => {
      room.activities.forEach((activity) => {
        acc[activity.id] = venue;

        activity.childActivities.forEach((child) => {
          acc[child.id] = venue;
        });
      });
    });
    return acc;
  }, {});

  return (activity: Activity) => venueActivityMap[activity.id];
};

/**
 * From a wcif, returns all of the unique days that have activities scheduled
 */
export const getScheduledDays = (wcif: Competition) => {
  const activities = getAllActivities(wcif).filter((i) => !i.childActivities.length);
  const allActivities = getActivitiesWithParsedDate(wcif)(activities);
  const findVenue = getVenueForActivity(wcif);

  const scheduleDays = allActivities
    .map((a) => {
      const venue = findVenue(a);
      const dateTime = new Date(a.startTime);

      const year = dateTime.getFullYear();
      const month = dateTime.getMonth();
      const day = dateTime.getDate();

      const dateString = `${year}-${month}-${day}`;

      const date = getNumericDateFormatter(venue?.timezone).format(dateTime);

      return {
        approxDateTime: dateTime.getTime(),
        date,
        dateParts: formatToParts(dateTime),
        dateString,
        activities: allActivities.filter((b) => b.date === date),
      };
    })
    // Filter to unique
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  return scheduleDays;
};

export const parseActivityStartDate = (activity: Activity, timeZone?: string) => {
  const dateTime = new Date(activity.startTime);
  return {
    approxDateTime: dateTime.getTime(),
    date: getNumericDateFormatter(timeZone).format(dateTime),
    dateParts: formatToParts(dateTime),
  };
};

export const getActivitiesWithParsedDate = (wcif: Competition) => {
  const findVenue = getVenueForActivity(wcif);

  return <T extends Activity>(activities: T[]) =>
    activities
      .map((activity) => ({
        ...activity,
        ...parseActivityStartDate(activity, findVenue(activity)?.timezone),
      }))
      .sort(byDate);
};

export const getRoomData = (
  room: Room,
  activity: Activity,
): {
  name: string;
  color: string;
} => {
  const stages = getNatsHelperRoomExtension(room)?.stages;
  const stageId = getNatsHelperGroupExtension(activity)?.stageId;

  if (stages === undefined || stageId === undefined) {
    return room;
  }

  const stage = stages.find((s) => s.id === stageId);
  if (!stage) {
    return room;
  }

  return stage;
};

export const getUniqueStartTimes = (activities: Activity[]) => {
  const startTimes = activities.map((i) => i.startTime);
  return startTimes.filter(unique);
};

export const getUniqueActivityTimes = (activities: Activity[]) => {
  const startTimes = activities.map((i) => i.startTime);
  const uniqueStartTimes = startTimes.filter(unique).toSorted();

  return uniqueStartTimes.map((time) => {
    const activitiesAtStartTime = activities.filter((i) => i.startTime === time);

    return {
      startTime: time,
      activities: activitiesAtStartTime,
    };
  });
};

export const doesActivityOverlapInterval = (
  activity: Activity,
  startTime: string,
  endTime: string,
) => {
  return (
    (activity.endTime > startTime && activity.endTime <= endTime) ||
    (activity.startTime < startTime && activity.endTime > endTime)
  );
};

export const hasActivities = (activityCode: string) => (stage: { activities: Activity[] }) =>
  stage.activities.some((a) => a.childActivities.some((ca) => ca.activityCode === activityCode));
