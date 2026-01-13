import { Activity, EventId, parseActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { Container } from '@/components/Container';
import { groupActivitiesByRound } from '@/lib/activities';
import { acceptedRegistration } from '@/lib/person';
import { hasAssignmentInStage } from '@/lib/person';
import { useWCIF } from '@/providers/WCIFProvider';

const groupNumber = ({ activityCode }: Activity) => parseActivityCode(activityCode)?.groupNumber;

const staffingAssignmentToText = ({ assignmentCode, activity }) =>
  `${assignmentCode.split('-')[1][0].toUpperCase()}${groupNumber(activity)}`;

const competingAssignmentToText = (activity) =>
  `${activity.parent.room.name[0]}${groupNumber(activity)}`;

const GroupsOverview = () => {
  const { wcif } = useWCIF();

  const memodGroupActivitiesForRound = useCallback(
    (activityCode) => (wcif ? groupActivitiesByRound(wcif, activityCode) : []),
    [wcif],
  );

  const assignmentsToObj = useCallback(
    (person) => {
      const obj = {
        competing: {},
        staffing: {},
      };
      wcif?.events.forEach((event) => {
        // get first round activities
        const activitiesForEvent = memodGroupActivitiesForRound(`${event.id}-r1`);
        const assignmentsForEvent = person.assignments
          .filter((assignment) => activitiesForEvent.some((a) => a.id === assignment.activityId))
          .map((assignment) => ({
            ...assignment,
            activity: activitiesForEvent.find((activity) => assignment.activityId === activity.id),
          }));

        const competingAssignment = assignmentsForEvent.find(
          ({ assignmentCode }) => assignmentCode === 'competitor',
        );
        const staffingAssignments = assignmentsForEvent.filter(
          ({ assignmentCode }) => assignmentCode.indexOf('staff') > -1,
        );

        obj.competing[event.id.toString()] =
          competingAssignment && competingAssignmentToText(competingAssignment.activity);

        obj.staffing[event.id.toString() + '_staff'] = staffingAssignments
          .map(staffingAssignmentToText)
          .join(',');
      });
      return obj;
    },
    [memodGroupActivitiesForRound, wcif?.events],
  );

  const assignments = useMemo(() => {
    return wcif?.persons
      .filter(acceptedRegistration)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((person) => {
        const a = assignmentsToObj(person);
        return { ...person, assignmentsData: a };
      });
  }, [assignmentsToObj, wcif?.persons]);

  const stages = wcif?.schedule?.venues?.flatMap((venue) => venue.rooms);

  const columns = (wcif?.events?.length || 0) * 2 + 2;

  return (
    <Container fullWidth className="overflow-x-scroll px-2">
      <table className="table-base table-row-hover">
        <thead>
          <tr>
            <td className="p-2 dark:text-white">Name</td>
            <td className="p-2 dark:text-white">WCA ID</td>
            {wcif?.events.map((event) => (
              <td key={event.id} className="p-2 bg-green-400 dark:bg-green-700 dark:text-white">
                {event.id}
              </td>
            ))}
            {wcif?.events.map((event) => (
              <td key={event.id} className="p-2 bg-blue-400 dark:bg-blue-700 dark:text-white">
                {event.id}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {stages?.map((stage) => {
            const childActivities = stage.activities.flatMap((ra) => ra.childActivities);

            return (
              <>
                <tr
                  style={{
                    backgroundColor: `${stage.color}3f`,
                  }}>
                  <td colSpan={columns} className="px-3 py-2 dark:text-white">
                    {stage.name}
                  </td>
                </tr>
                {assignments
                  ?.filter((person) => hasAssignmentInStage(stage, person))
                  .map((person) => {
                    const assignments =
                      person.assignments?.map((assignment) => {
                        const activity = childActivities.find(
                          (ca) => ca.id === assignment.activityId,
                        );

                        return {
                          ...assignment,
                          activity,
                          ...(activity?.activityCode && {
                            ...(parseActivityCode(activity?.activityCode) as {
                              eventId: EventId;
                              roundNumber: number;
                              groupNumber: number;
                            }),
                          }),
                        };
                      }) || [];
                    const competingAssignments = assignments.filter(
                      ({ assignmentCode }) => assignmentCode === 'competitor',
                    );
                    const staffingAssignments = assignments.filter(
                      ({ assignmentCode }) => assignmentCode.indexOf('staff') > -1,
                    );

                    return (
                      <tr key={person.registrantId}>
                        <td className="p-2 dark:text-white">{person.name}</td>
                        <td className="p-2 dark:text-white">{person.wcaId}</td>
                        {wcif?.events.map((event) => {
                          const competingAssignment = competingAssignments.find(
                            (a) => a.eventId === event.id && a.roundNumber === 1,
                          );

                          return (
                            <td
                              key={event.id}
                              className={classNames('text-center p-2 dark:text-white', {
                                'bg-green-200 dark:bg-green-800': !!competingAssignment,
                              })}>
                              {competingAssignment?.groupNumber}
                            </td>
                          );
                        })}
                        {wcif?.events.map((event) => {
                          const staffingAssignment = staffingAssignments.find(
                            (a) => a.eventId === event.id && a.roundNumber === 1,
                          );
                          return (
                            <AssignmentCodeCell
                              key={event.id}
                              assignmentCode={staffingAssignment?.assignmentCode}>
                              {staffingAssignment && staffingAssignmentToText(staffingAssignment)}
                            </AssignmentCodeCell>
                          );
                        })}
                      </tr>
                    );
                  })}
              </>
            );
          })}
        </tbody>
      </table>
    </Container>
  );
};

export default GroupsOverview;
