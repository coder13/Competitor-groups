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
  city_name: string;
  country_iso2: string;
  start_date: string;
  end_date: string;
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
