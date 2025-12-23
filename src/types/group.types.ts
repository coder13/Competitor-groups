import { Assignment, Competition, Person, Room, Venue } from '@wca/helpers';

export interface ExtendedPerson extends Person {
  assignment?: Assignment;
  activity?: any;
  room?: Room & { venue: Venue };
  stage?: { name: string; color: string };
  wcif?: Competition;
}
