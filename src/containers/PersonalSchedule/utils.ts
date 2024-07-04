import { Activity, Assignment, Competition, Person } from '@wca/helpers';
import { byDate } from '../../lib/utils';
import { getAllActivities, getRooms } from '../../lib/activities';
import { getWorldAssignmentsExtension } from '../../extensions/com.competitiongroups.worldsassignments';
import { formatNumericDate, getNumericDateFormatter } from '../../lib/time';
import { ActivityWithRoomOrParent } from '../../lib/types';
import { isActivityWithRoomOrParent } from '../../lib/typeguards';

export const getNormalAssignments = (wcif: Competition, person: Person) => {
  const allActivities = getAllActivities(wcif);

  const assignments = person.assignments
    ? person.assignments
        ?.map((assignment) => ({
          ...assignment,
          activity: allActivities.find(({ id }) => id === assignment.activityId),
        }))
        .sort((a, b) => byDate(a.activity, b.activity))
    : [];

  return assignments;
};

const getExtraAssignments = (person: Person) => {
  const { assignments } = getWorldAssignmentsExtension(person.extensions);

  return assignments.map((assignment) => ({
    assignmentCode: assignment.staff,
    activityId: null,
    activity: {
      startTime: assignment.startTime,
      endTime: assignment.endTime,
    },
  }));
};

export const getAllAssignments = (wcif: Competition, person: Person) => {
  const normalAssignments = getNormalAssignments(wcif, person);
  const extraAssignments = getExtraAssignments(person);

  const allAssignments = [...normalAssignments, ...extraAssignments].sort((a, b) =>
    byDate(a.activity, b.activity)
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

  return allAssignments
    .map((a) => {
      const parent = a.activity && 'parent' in a.activity && a.activity.parent;
      const roomId = a.activity && 'room' in a.activity && a.activity.room.id;

      const venue = venues.find((v) => v.rooms.some((r) => r.id === roomId || parent));

      const dateTime = new Date(a.activity.startTime);
      const date = formatNumericDate(dateTime, venue?.timezone);

      return {
        approxDateTime: dateTime.getTime(),
        date: date,
        dateParts: getNumericDateFormatter(venue?.timezone).formatToParts(dateTime),
        assignments: assignmentsWithParsedDate.filter((b) => b.date === date),
      };
    })
    .filter(({ assignments }) => assignments.length)
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);
};

export const getAssignmentsWithParsedDate = (wcif: Competition, person: Person) => {
  const allAssignments = getAllAssignments(wcif, person);
  const venues = wcif.schedule.venues;

  return allAssignments
    .map((assignment) => {
      const { activity } = assignment;
      if (!isActivityWithRoomOrParent(activity) && 'startTime' in activity) {
        return {
          ...assignment,
          date: formatNumericDate(new Date(activity.startTime), venues[0].timezone),
        };
      }

      if (isActivityWithRoomOrParent(activity)) {
        const roomId = (activity.room || activity.parent?.room)?.id;

        const venue = activity?.room?.id
          ? venues.find((v) => v.rooms.some((r) => r.id === roomId))
          : venues[0];

        const dateTime = new Date(activity.startTime);

        return {
          ...assignment,
          date: formatNumericDate(dateTime, venue?.timezone),
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => byDate(a.activity, b.activity));
};
