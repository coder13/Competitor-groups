import { Activity } from '@wca/helpers';
import { ActivityWithRoomOrParent } from './types';

export const isActivity = (activity: any): activity is ActivityWithRoomOrParent => {
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

export const isRoundActivity = (activity: any): activity is ActivityWithRoomOrParent => {
  return isActivity(activity) && 'room' in activity;
};

export const isGroupActivity = (activity: any): activity is ActivityWithRoomOrParent => {
  return isActivity(activity) && 'parent' in activity;
};

export const isActivityWithRoomOrParent = (activity: any): activity is ActivityWithRoomOrParent => {
  return (isActivity(activity) && 'room' in activity) || 'parent' in activity;
};
