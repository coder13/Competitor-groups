interface User {
  id: number;
  name: string;
  email: string;
  wca_id: string;
  avatar?: {
    url?: string;
    thumb_url?: string;
  };
  delegate_status: string;
}

interface ApiCompetition {
  id: string;
  name: string;
  short_name: string;
  city: string;
  country_iso2: string;
  start_date: string;
  end_date: string;
  announced_at: string;
  cancelled_at: string;
  latitude_degrees: number;
  longitude_degrees: number;
  venue_address: string;
  venue_details: string;
  website: string;
  event_ids: string[];
  organizers: User[];
  delegates: User[];
}

interface ApiCompetitionTab {
  id: number;
  competition_id: string;
  name: string;
  content: string;
  display_order: number;
}

type CondensedApiCompetiton = Pick<
  ApiCompetition,
  'name' | 'id' | 'start_date' | 'end_date' | 'city' | 'country_iso2' | 'short_name'
>;

declare module '@wca/helpers/' {
  import { AssignmentCode } from '@wca/helpers';
  interface Assignment {
    activityId: number;
    stationNumber?: number;
    assignmentCode: AssignmentCode;
  }
}
