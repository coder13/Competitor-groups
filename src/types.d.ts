///<reference path="">

interface User {
  id: number;
  name: string;
  email: string;
  wca_id: string;
  avatar?: {
    url?: string;
    thumb_url?: string;
  };
}

interface ApiCompetition {
  id: string;
  name: string;
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
}

declare module '@wca/helpers/' {
  import { AssignmentCode } from '@wca/helpers';
  interface Assignment {
    activityId: number;
    stationNumber?: number;
    assignmentCode: AssignmentCode;
  }
}
