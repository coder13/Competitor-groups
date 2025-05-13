import { Activity, Room } from '@wca/helpers';
import { ActivityWithRoomOrParent } from './types';

export const isActivity = (activity: Activity | Room): activity is Activity => {
  return (
    'childActivities' in activity &&
    'name' in activity &&
    'id' in activity &&
    typeof activity.id === 'number' &&
    activity.id >= 0 &&
    'activityCode' in activity &&
    'startTime' in activity &&
    'endTime' in activity &&
    'childActivities' in activity &&
    'extensions' in activity
  );
};

export const isRoundActivity = (activity: Activity): activity is ActivityWithRoomOrParent => {
  return isActivity(activity) && 'room' in activity;
};

export const isGroupActivity = (activity: Activity): activity is ActivityWithRoomOrParent => {
  return isActivity(activity) && 'parent' in activity;
};

export const isActivityWithRoomOrParent = (
  activity: Activity
): activity is ActivityWithRoomOrParent => {
  return (isActivity(activity) && 'room' in activity) || 'parent' in activity;
};
