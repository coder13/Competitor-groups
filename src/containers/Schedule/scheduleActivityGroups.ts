import { Competition, Room, Venue } from '@wca/helpers';
import { getRoomData, getVenueForActivity } from '@/lib/activities';
import { activityCodeToName, parseActivityCodeFlexible, toRoundId } from '@/lib/activityCodes';
import { ActivityWithRoomOrParent } from '@/lib/types';

export interface ScheduleActivityLocation {
  color: string;
  id: string;
  name: string;
}

export interface ScheduleActivityGroup {
  activities: ActivityWithRoomOrParent[];
  activityCode: string;
  endTime: string;
  id: string;
  name: string;
  rooms: ScheduleActivityLocation[];
  startTime: string;
  timeZone?: Venue['timezone'];
  to: string;
}

const getActivityRoom = (activity: ActivityWithRoomOrParent): Room | undefined =>
  activity?.parent?.parent?.room || activity?.parent?.room || activity?.room;

const getActivityLocation = (
  activity: ActivityWithRoomOrParent,
): ScheduleActivityLocation | undefined => {
  const room = getActivityRoom(activity);
  if (!room) {
    return undefined;
  }

  const roomData = getRoomData(room, activity);
  return {
    color: roomData.color,
    id: `${room.id}-${roomData.name}`,
    name: roomData.name,
  };
};

const uniqueLocations = (activities: ActivityWithRoomOrParent[]) =>
  Array.from(
    new Map(
      activities
        .map(getActivityLocation)
        .filter((location): location is ScheduleActivityLocation => Boolean(location))
        .map((location) => [location.id, location]),
    ).values(),
  );

const getActivityName = (activity: ActivityWithRoomOrParent) =>
  activity.activityCode.startsWith('other')
    ? activity.name || activity.activityCode
    : activityCodeToName(activity.activityCode);

export const getScheduleActivityPath = (
  competitionId: string,
  activity: ActivityWithRoomOrParent,
) => {
  try {
    const { groupNumber, roundNumber } = parseActivityCodeFlexible(activity.activityCode);

    if (roundNumber && groupNumber) {
      return `/competitions/${competitionId}/events/${toRoundId(activity.activityCode)}/${groupNumber}`;
    }

    if (roundNumber) {
      return `/competitions/${competitionId}/events/${toRoundId(activity.activityCode)}`;
    }
  } catch {
    return `/competitions/${competitionId}/activities/${activity.id}`;
  }

  return `/competitions/${competitionId}/activities/${activity.id}`;
};

export const getScheduleActivityGroups = (
  wcif: Competition,
  activities: ActivityWithRoomOrParent[],
): ScheduleActivityGroup[] => {
  const findVenue = getVenueForActivity(wcif);
  const groupsByActivityCode = activities.reduce((groups, activity) => {
    const group = groups.get(activity.activityCode) || [];
    group.push(activity);
    groups.set(activity.activityCode, group);
    return groups;
  }, new Map<string, ActivityWithRoomOrParent[]>());

  return Array.from(groupsByActivityCode.entries())
    .map(([activityCode, groupedActivities]) => {
      const sortedActivities = groupedActivities.toSorted((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      const firstActivity = sortedActivities[0];
      const startTime = sortedActivities.map((activity) => activity.startTime).toSorted()[0];
      const endTime =
        sortedActivities
          .map((activity) => activity.endTime)
          .toSorted()
          .at(-1) || '';

      return {
        activities: sortedActivities,
        activityCode,
        endTime,
        id: activityCode,
        name: firstActivity ? getActivityName(firstActivity) : activityCode,
        rooms: uniqueLocations(sortedActivities),
        startTime,
        timeZone: firstActivity ? findVenue(firstActivity)?.timezone : undefined,
        to: firstActivity ? getScheduleActivityPath(wcif.id, firstActivity) : '',
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
};
