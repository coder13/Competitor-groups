import { Activity } from '@wca/helpers';
import { ActivityWithRoomOrParent } from './types';

export const isActivity = (activity: any): activity is ActivityWithRoomOrParent => {
  return (
    'childActivities' in activity &&
    'name' in activity &&
    'id' in activity &&
    'activityCode' in activity
  );
};

export const isActivityWithRoomOrParent = (activity: any): activity is ActivityWithRoomOrParent => {
  return (isActivity(activity) && 'room' in activity) || 'parent' in activity;
};
