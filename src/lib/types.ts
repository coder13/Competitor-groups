import { Activity, Room } from '@wca/helpers';

export interface ActivityWithRoomOrParent extends Activity {
  room?: Room;
  parent?: ActivityWithRoomOrParent;
  childActivities: ActivityWithRoomOrParent[];
}
