import { Activity, Competition, Room } from '@wca/helpers';
import { getRooms } from './activities';
import { NotifyCompActivity } from './notifyCompRemoteGraphql';

export interface RemoteScheduledActivity extends Activity {
  parent?: Activity;
  room: Room;
}

export interface RemoteActivityState {
  liveActivity?: NotifyCompActivity;
  scheduledActivity: RemoteScheduledActivity;
  status: 'next' | 'current' | 'done';
}

export interface RemoteActivityGroup {
  id: string;
  name: string;
  scheduledActivities: RemoteScheduledActivity[];
  liveActivities: NotifyCompActivity[];
  status: 'next' | 'current' | 'done' | 'mixed';
}

export const getRemoteScheduledActivities = (wcif: Competition, roomId?: number) =>
  getRooms(wcif)
    .filter((room) => roomId === undefined || room.id === roomId)
    .flatMap((room) =>
      room.activities.flatMap((activity) => {
        const childActivities = activity.childActivities.map((child) => ({
          ...child,
          parent: activity,
        }));
        const activities = childActivities.length ? childActivities : [activity];

        return activities.map((scheduledActivity) => ({
          ...scheduledActivity,
          room,
        }));
      }),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

export const getRemoteActivityState = (
  scheduledActivity: RemoteScheduledActivity,
  liveActivities: NotifyCompActivity[],
): RemoteActivityState => {
  const liveActivity = liveActivities.find(
    (activity) => activity.activityId === scheduledActivity.id,
  );

  if (liveActivity?.startTime && !liveActivity.endTime) {
    return {
      liveActivity,
      scheduledActivity,
      status: 'current',
    };
  }

  if (liveActivity?.endTime) {
    return {
      liveActivity,
      scheduledActivity,
      status: 'done',
    };
  }

  return {
    liveActivity,
    scheduledActivity,
    status: 'next',
  };
};

export const getRemoteActivityStates = (
  scheduledActivities: RemoteScheduledActivity[],
  liveActivities: NotifyCompActivity[],
) => scheduledActivities.map((activity) => getRemoteActivityState(activity, liveActivities));

const normalizeActivityCode = (activity: Activity) => {
  const code = activity.activityCode || activity.name;
  return code.replace(/-g\d+$/i, '');
};

export const getRemoteActivityGroups = (
  scheduledActivities: RemoteScheduledActivity[],
  liveActivities: NotifyCompActivity[],
): RemoteActivityGroup[] => {
  const groups = scheduledActivities.reduce<Record<string, RemoteScheduledActivity[]>>(
    (acc, activity) => {
      const key = normalizeActivityCode(activity);
      acc[key] = [...(acc[key] || []), activity];
      return acc;
    },
    {},
  );

  return Object.entries(groups).map(([id, activities]) => {
    const activityIds = new Set(activities.map((activity) => activity.id));
    const groupLiveActivities = liveActivities.filter((activity) =>
      activityIds.has(activity.activityId),
    );
    const states = getRemoteActivityStates(activities, liveActivities);
    const statuses = new Set(states.map((state) => state.status));

    return {
      id,
      name: activities[0]?.parent?.name || activities[0]?.name || id,
      scheduledActivities: activities,
      liveActivities: groupLiveActivities,
      status: statuses.size === 1 ? states[0].status : 'mixed',
    };
  });
};

export const splitRemoteActivityStates = (states: RemoteActivityState[]) => ({
  current: states.filter((state) => state.status === 'current'),
  next: states.filter((state) => state.status === 'next'),
  done: states.filter((state) => state.status === 'done'),
});
