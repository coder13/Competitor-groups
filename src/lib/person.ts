import { EventId, Person, Room } from '@wca/helpers';

export const hasAssignmentInStage = (stage: Room, person: Person) => {
  const roundActivities = stage.activities.flatMap((ra) => ra.childActivities);
  const childActivityIds = roundActivities.map((a) => a.id);
  return person.assignments?.some((a) => childActivityIds.includes(a.activityId));
};

export const acceptedRegistration = ({ registration }: Person): boolean =>
  registration?.status === 'accepted';

export const isRegisteredForEvent =
  (eventId: EventId) =>
  ({ registration }: Person): boolean =>
    !!registration && registration.eventIds.includes(eventId);
