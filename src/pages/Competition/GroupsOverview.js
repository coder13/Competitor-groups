import { useCallback, useMemo, useState } from 'react';
import {
  acceptedRegistration,
  groupActivitiesByRound,
  parseActivityCode,
} from '../../lib/activities';
import { useWCIF } from './WCIFProvider';

const groupNumber = ({ activityCode }) => parseActivityCode(activityCode)?.groupNumber;

const staffingAssignmentToText = ({ assignmentCode, activity }) =>
  `${assignmentCode.split('-')[1][0].toUpperCase()}${groupNumber(activity)}`;

const competingAssignmentToText = (activity) =>
  `${activity.parent.room.name[0]}${groupNumber(activity)}`;

const GroupsOverview = () => {
  const { wcif } = useWCIF();

  const memodGroupActivitiesForRound = useCallback(
    (activityCode) => groupActivitiesByRound(wcif, activityCode),
    [wcif]
  );

  const assignmentsToObj = useCallback(
    (person) => {
      const obj = {
        competing: {},
        staffing: {},
      };
      wcif.events.forEach((event) => {
        // get first round activities
        const activitiesForEvent = memodGroupActivitiesForRound(`${event.id}-r1`);
        const assignmentsForEvent = person.assignments
          .filter((assignment) => activitiesForEvent.some((a) => a.id === assignment.activityId))
          .map((assignment) => ({
            ...assignment,
            activity: activitiesForEvent.find((activity) => assignment.activityId === activity.id),
          }));

        const competingAssignment = assignmentsForEvent.find(
          ({ assignmentCode }) => assignmentCode === 'competitor'
        );
        const staffingAssignments = assignmentsForEvent.filter(
          ({ assignmentCode }) => assignmentCode.indexOf('staff') > -1
        );

        obj.competing[event.id.toString()] = competingAssignment
          ? competingAssignmentToText(competingAssignment.activity)
          : '-';

        obj.staffing[event.id.toString() + '_staff'] =
          staffingAssignments.map(staffingAssignmentToText).join(',') || '-';
      });
      return obj;
    },
    [memodGroupActivitiesForRound, wcif.events]
  );

  const assignments = useMemo(() => {
    return wcif.persons
      .filter(acceptedRegistration)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((person) => {
        const a = assignmentsToObj(person);
        console.log(person, a);
        return { ...person, assignmentsData: a };
      });
  }, [assignmentsToObj, wcif.persons]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <td className="p-2">Name</td>
            <td className="p-2">WCA ID</td>
            {wcif.events.map((event) => (
              <td key={event.id} className="p-2">
                {event.id}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {assignments.map((person) => (
            <tr key={person.id}>
              <td className="p-2">{person.name}</td>
              <td className="p-2">{person.wcaId}</td>
              {wcif.events.map((event) => (
                <td key={event.id}>
                  {person.assignmentsData.competing[event.id.toString()] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupsOverview;
