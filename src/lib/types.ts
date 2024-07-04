import { Activity, Room, Venue } from '@wca/helpers';

export interface RoomWithVenue extends Room {
  venue: Venue;
}

export interface RoundActivity extends Activity {
  room: RoomWithVenue;
}

export interface GroupActivity extends RoundActivity {
  parent: RoundActivity;
}

export interface ActivityWithRoomOrParent extends Activity {
  room?: Room;
  parent?: ActivityWithRoomOrParent;
  childActivities: ActivityWithRoomOrParent[];
}
