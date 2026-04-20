import { Activity, EventId, parseActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { Fragment, useCallback, useMemo } from 'react';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { Container } from '@/components/Container';
import { groupActivitiesByRound } from '@/lib/activities';
import { acceptedRegistration, hasAssignmentInStage } from '@/lib/person';
import { useWCIF } from '@/providers/WCIFProvider';

const groupNumber = ({ activityCode }: Activity) => parseActivityCode(activityCode)?.groupNumber;

const staffingAssignmentToText = ({ assignmentCode, activity }) =>
  `${assignmentCode.split('-')[1][0].toUpperCase()}${groupNumber(activity)}`;

const competingAssignmentToText = (activity) =>
  `${activity.parent.room.name[0]}${groupNumber(activity)}`;

export function CompetitionGroupsOverviewContainer() {
  const { wcif } = useWCIF();

  const memoizedGroupActivitiesForRound = useCallback(
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
        const activitiesForEvent = memoizedGroupActivitiesForRound(`${event.id}-r1`);
        const assignmentsForEvent = person.assignments
          .filter((assignment) =>
            activitiesForEvent.some((activity) => activity.id === assignment.activityId),
          )
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
    [memoizedGroupActivitiesForRound, wcif?.events],
  );

  const assignments = useMemo(
    () =>
      wcif?.persons
        .filter(acceptedRegistration)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((person) => ({
          ...person,
          assignmentsData: assignmentsToObj(person),
        })),
    [assignmentsToObj, wcif?.persons],
  );

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
              <td
                key={event.id}
                className="bg-assignment-competitor p-2 text-assignment-competitor">
                {event.id}
              </td>
            ))}
            {wcif?.events.map((event) => (
              <td key={event.id} className="bg-assignment-judge p-2 text-assignment-judge">
                {event.id}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {stages?.map((stage) => {
            const childActivities = stage.activities.flatMap(
              (roundActivity) => roundActivity.childActivities,
            );

            return (
              <Fragment key={stage.id}>
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
                    const personAssignments =
                      person.assignments?.map((assignment) => {
                        const activity = childActivities.find(
                          (childActivity) => childActivity.id === assignment.activityId,
                        );

                        return {
                          ...assignment,
                          activity,
                          ...(activity?.activityCode && {
                            ...(parseActivityCode(activity.activityCode) as {
                              eventId: EventId;
                              roundNumber: number;
                              groupNumber: number;
                            }),
                          }),
                        };
                      }) || [];

                    const competingAssignments = personAssignments.filter(
                      ({ assignmentCode }) => assignmentCode === 'competitor',
                    );
                    const staffingAssignments = personAssignments.filter(
                      ({ assignmentCode }) => assignmentCode.indexOf('staff') > -1,
                    );

                    return (
                      <tr key={person.registrantId}>
                        <td className="p-2 dark:text-white">{person.name}</td>
                        <td className="p-2 dark:text-white">{person.wcaId}</td>
                        {wcif?.events.map((event) => {
                          const competingAssignment = competingAssignments.find(
                            (assignment) =>
                              assignment.eventId === event.id && assignment.roundNumber === 1,
                          );

                          return (
                            <td
                              key={event.id}
                              className={classNames('p-2 text-center text-default', {
                                'bg-assignment-competitor': !!competingAssignment,
                              })}>
                              {competingAssignment?.groupNumber}
                            </td>
                          );
                        })}
                        {wcif?.events.map((event) => {
                          const staffingAssignment = staffingAssignments.find(
                            (assignment) =>
                              assignment.eventId === event.id && assignment.roundNumber === 1,
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
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </Container>
  );
}
