import { Link, useParams } from 'react-router-dom';
import {
  activityCodeToName,
  allRoundActivities,
  rooms,
} from '../../lib/activities';
import { Container } from '../../components/Container';
import { ActivityCode } from '@wca/helpers';
import { useWCIF } from './WCIFProvider';
import {
  AssignmentCodeRank,
  SupportedAssignmentCode,
} from '../../lib/assignments';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';
import { Fragment } from 'react';
import { formatDateTimeRange } from '../../lib/utils';

const GroupAssignmentCodeRank: SupportedAssignmentCode[] = [
  'staff-delegate',
  'staff-announcer',
  'staff-stagelead',
  'staff-dataentry',
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-other',
  'competitor',
];

export default function Group() {
  const { wcif } = useWCIF();
  const { roundId, groupNumber } = useParams();
  const activityCode = `${roundId}-g${groupNumber}` as ActivityCode;

  const stages = wcif ? rooms(wcif) : [];
  const roundActivies = wcif ? allRoundActivities(wcif) : [];

  // All activities that relate to the activityCode
  const childActivities = roundActivies
    ?.flatMap((activity) => activity.childActivities)
    .filter((ca) => ca.activityCode === activityCode);
  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivity = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId)
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) =>
        childActivityIds.includes(a.activityId)
      );
      const activity = childActivities.find(
        (ca) => ca.id === assignment?.activityId
      );
      const stage = stages.find((stage) =>
        stage.activities.some((a) =>
          a.childActivities.some((ca) => ca.id === activity?.id)
        )
      );

      return {
        ...person,
        assignment,
        activity,
        stage,
      };
    });

  // Get everyone associated with this activityCode
  // Split everyone up by assignmentCode and communicate where they are supposed to be for each group.

  return (
    <Container className="space-y-2">
      <div className="p-2">
        <h3 className="text-2xl">
          Groups for {activityCodeToName(activityCode)}
        </h3>

        <div className="grid grid-cols-3 grid-rows-2">
          {stages?.map((stage) => {
            const activity = stage.activities.find((a) =>
              a.childActivities.some((ca) => ca.activityCode === activityCode)
            );

            return (
              <Fragment key={stage.id}>
                <div className="col-span-1">{stage.name}:</div>
                <div className="col-span-2">
                  {activity &&
                    formatDateTimeRange(activity.startTime, activity.endTime)}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-3">
        {GroupAssignmentCodeRank.filter((assignmentCode) =>
          personsInActivity?.some(
            (person) => person.assignment?.assignmentCode === assignmentCode
          )
        ).map((assignmentCode) => (
          <Fragment key={assignmentCode}>
            <AssignmentCodeCell
              as="div"
              assignmentCode={assignmentCode}
              className="col-span-3 py-1 px-1 text-center mt-2 shadow-md"
            />
            {personsInActivity
              ?.filter(
                (person) => person.assignment?.assignmentCode === assignmentCode
              )
              .sort((a, b) =>
                (a.stage?.name || '').localeCompare(b.stage?.name || '')
              )
              ?.map((person) => (
                <Link
                  key={person.registrantId}
                  to={`/competitions/${wcif?.id}/persons/${person.registrantId}`}
                  className="col-span-3 grid grid-cols-3 grid-rows-1 hover:opacity-80">
                  <div className="col-span-2 py-1 px-1">{person.name}</div>
                  <div
                    className="col-span-1 py-1 px-1"
                    style={{
                      backgroundColor: person.stage?.color
                        ? `${person.stage?.color}7f`
                        : undefined,
                    }}>
                    {person.stage && person.stage.name}
                  </div>
                </Link>
              ))}
          </Fragment>
        ))}
      </div>
    </Container>
  );
}
