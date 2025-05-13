import { Activity, Assignment, Competition, Person } from '@wca/helpers';
import { getWorldAssignmentsExtension } from '@/extensions/com.competitiongroups.worldsassignments';
import { getAllActivities, getRooms } from '@/lib/activities';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { shortEventNameById } from '@/lib/events';
import { formatNumericDate, getNumericDateFormatter } from '@/lib/time';
import { byDate } from '@/lib/utils';

export const getNormalAssignments = (wcif: Competition, person: Person) => {
  const allActivities = getAllActivities(wcif);

  const assignments = person.assignments
    ? person.assignments
        ?.map((assignment) => ({
          type: 'normal',
          ...assignment,
          activity: allActivities.find(({ id }) => id === assignment.activityId),
        }))
        .sort((a, b) => byDate(a.activity, b.activity))
    : [];

  return assignments;
};

const getExtraAssignments = (person: Person) => {
  const { assignments } = getWorldAssignmentsExtension(person.extensions);

  return assignments.map(
    (
      assignment,
    ): Assignment & {
      type: 'extra';
      activity: Activity;
    } => ({
      type: 'extra',
      assignmentCode: assignment.staff,
      activityId: -1,
      stationNumber: null,
      activity: {
        activityCode: 'other-' + assignment.staff,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        childActivities: [],
        extensions: [],
        id: -1,
        name: assignment.staff,
        scrambleSetId: null,
      },
    }),
  );
};

export const getAllAssignments = (wcif: Competition, person: Person) => {
  const normalAssignments = getNormalAssignments(wcif, person);
  const extraAssignments = getExtraAssignments(person);

  const allAssignments = [...normalAssignments, ...extraAssignments].sort((a, b) =>
    byDate(a.activity, b.activity),
  );

  return allAssignments;
};

/**
 * Returns an array of each day that the person has an assignment.
 */
export const getGroupedAssignmentsByDate = (wcif: Competition, person: Person) => {
  const allAssignments = getAllAssignments(wcif, person);
  const assignmentsWithParsedDate = getAssignmentsWithParsedDate(wcif, person);

  const venues = wcif.schedule.venues || [];

  const scheduledDays = allAssignments
    .map((a) => {
      if (a.type === 'extra') {
        return {
          approxDateTime: 0,
          date: '',
          dateParts: [],
          assignments: [],
        };
      }

      if (!a.activity) {
        return {
          approxDateTime: 0,
          date: '',
          dateParts: [],
          assignments: [],
        };
      }

      const roomId = a.activity && 'room' in a.activity && a.activity.room?.id;
      const parent = a.activity && 'parent' in a.activity && a.activity.parent;

      const venue = venues.find((v) => v.rooms.some((r) => r.id === roomId || parent));

      const dateTime = new Date(a.activity?.startTime);
      const date = formatNumericDate(dateTime, venue?.timezone);

      return {
        approxDateTime: dateTime.getTime(),
        date: date,
        dateParts: getNumericDateFormatter(venue?.timezone).formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i);

  return scheduledDays
    .map(({ date, ...props }) => ({
      ...props,
      date,
      assignments: assignmentsWithParsedDate.filter((a) => a.date === date),
    }))
    .filter(({ assignments }) => assignments.length)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);
};

export const getAssignmentsWithParsedDate = (wcif: Competition, person: Person) => {
  const allAssignments = getAllAssignments(wcif, person);
  const venues = wcif.schedule.venues;
  const rooms = getRooms(wcif);

  return allAssignments
    .map((assignment) => {
      const { activity } = assignment;

      if (!activity) {
        return null;
      }

      if (assignment.type === 'extra') {
        return {
          assignment,
          activity,
          date: formatNumericDate(new Date(activity.startTime), venues[0].timezone),
        };
      }

      if (assignment.type === 'normal') {
        if (!activity || !('room' in activity || 'parent' in activity)) {
          return {
            assignment,
            date: formatNumericDate(new Date(), venues[0].timezone),
          };
        }

        const roomId = (activity.room || activity.parent?.room)?.id;

        const venue = activity?.room?.id ? rooms.find((r) => r.id === roomId)?.venue : venues[0];

        const dateTime = new Date(activity.startTime);

        return {
          assignment,
          activity,
          date: formatNumericDate(dateTime, venue?.timezone),
        };
      }
    })
    .filter(Boolean)
    .sort((a, b) => byDate(a.activity, b.activity));
};

export const formatBriefActivityName = (activity: Activity) => {
  const { eventId, roundNumber, attemptNumber } = parseActivityCodeFlexible(activity.activityCode);

  return activity.activityCode.startsWith('other')
    ? activity.name
    : [
        `${shortEventNameById(eventId)}`,
        `${roundNumber && roundNumber > 1 ? `R${roundNumber}` : ''}`,
        `${attemptNumber ? `A${attemptNumber}` : ''}`,
      ]
        .filter(Boolean)
        .join(' ');
};
