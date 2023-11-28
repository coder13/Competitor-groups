import { Link } from 'react-router-dom';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';
import { useWCIF } from '../../pages/Competition/WCIFProvider';
import { allChildActivities, allRoundActivities, rooms } from '../../lib/activities';
import { GroupAssignmentCodeRank } from '../../pages/Competition/Group';
import { Fragment } from 'react';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';
import { formatTime } from '../../lib/utils';
import { useNow } from '../../hooks/useNow';
import { formatDuration, intervalToDuration } from 'date-fns';

const useCommon = (competitionId: string) => {
  const { wcif } = useWCIF();

  const { ongoingActivities, ...rest } = useOngoingActivities(competitionId!);

  const stages = wcif ? rooms(wcif) : [];
  const roundActivities = wcif ? allRoundActivities(wcif) : [];
  const multistage = stages.length > 1;

  // All activities that relate to the ongoing activities
  const childActivities = roundActivities
    ?.flatMap((activity) => allChildActivities(activity))
    .filter((ca) => ongoingActivities.some((oa) => oa.id === ca.id));

  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivities = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId)
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const stage = stages.find((stage) =>
        stage.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id))
      );

      return {
        ...person,
        assignment,
        activity,
        stage,
      };
    })
    .sort((a, b) => (b.activity?.id || 0) - (a.activity?.id || 0));

  return {
    wcif,
    stages,
    roundActivities,
    multistage,
    childActivities,
    personsInActivities,
    ...rest,
  };
};

interface LiveActivitiesProps {
  competitionId: string;
}

export const LiveActivities = ({ competitionId }: LiveActivitiesProps) => {
  const { multistage, childActivities, personsInActivities, liveActivities } =
    useCommon(competitionId);
  const now = useNow();

  return (
    <div className="grid grid-cols-12 space-y-2">
      <div className="col-span-full grid grid-cols-12 gap-x-4">
        <div className="col-span-6 font-bold p-1">Activity</div>
        <div className="col-span-3 font-bold p-1">Started</div>
        <div className="col-span-3 font-bold p-1">Duration</div>
        {childActivities?.map((activity) => {
          const liveActivity = liveActivities?.find((la) => la.activityId === activity.id);
          const { minutes, hours } = intervalToDuration({
            start: new Date(liveActivity?.startTime!),
            end: now,
          });
          const duration = formatDuration({ hours, minutes });

          return (
            <Fragment>
              {/* {multistage && <div className="col-span-3">{activity.room?.name}:</div>} */}
              <div className="p-1 col-span-6">{activity.name}</div>
              <div className="p-1 col-span-3">{formatTime(liveActivity?.startTime!)}</div>
              <div className="p-1 col-span-3">{minutes ? duration : 'now'}</div>
            </Fragment>
          );
        })}
      </div>

      <hr className="col-span-full" />

      {GroupAssignmentCodeRank.filter((assignmentCode) =>
        personsInActivities?.some((person) => person.assignment?.assignmentCode === assignmentCode)
      ).map((assignmentCode) => (
        <Fragment key={assignmentCode}>
          <AssignmentCodeCell
            as="div"
            border
            assignmentCode={assignmentCode}
            className="px-2 py-1 text-xl drop-shadow-lg font-bold col-span-full"
          />
          {childActivities.map((ca) => {
            const personsInActivity = personsInActivities?.filter(
              (person) =>
                person.activity?.id === ca.id &&
                person.assignment?.assignmentCode === assignmentCode
            );
            console.log(ca.activityCode, assignmentCode, personsInActivity);
            // const backgroundColor = ca.parent?.room?.color
            //   ? `${ca.parent?.room?.color}7f`
            //   : undefined;

            if (!personsInActivity || personsInActivity?.length === 0) {
              return null;
            }

            return (
              <div key={ca.id} className="col-span-full grid grid-cols-2 group">
                <div
                  className="col-span-1 px-2 py-1 group-hover:bg-slate-100 transition duration-75 ease-in-out transform"
                  style={{
                    gridRow: `span ${personsInActivity?.length || 0}`,
                  }}>
                  {ca.name}
                </div>

                {personsInActivity
                  ?.filter((person) => person.assignment?.assignmentCode === assignmentCode)
                  .sort((a, b) => (a.stage?.name || '').localeCompare(b.stage?.name || ''))
                  ?.map((person) => {
                    return (
                      <Link
                        key={ca.id.toString() + assignmentCode + person.registrantId}
                        to={`/competitions/${competitionId}/persons/${person.registrantId}`}
                        className="col-span-1 px-2 py-1 hover:bg-slate-100 transition duration-75 ease-in-out transform">
                        {person.name}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
          <div className="col-span-full w-2" />
        </Fragment>
      ))}
    </div>
  );
};
