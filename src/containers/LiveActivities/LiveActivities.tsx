import { formatDuration, intervalToDuration } from 'date-fns';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { useNow } from '@/hooks/useNow/useNow';
import { useOngoingActivities } from '@/hooks/useOngoingActivities';
import { getAllChildActivities, getAllRoundActivities, getRooms } from '@/lib/activities';
import { GroupAssignmentCodeRank } from '@/lib/constants';
import { formatTime } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';

const useCommon = (competitionId: string) => {
  const { wcif } = useWCIF();

  const { ongoingActivities, ...rest } = useOngoingActivities(competitionId!);

  const stages = wcif ? getRooms(wcif) : [];
  const roundActivities = wcif ? getAllRoundActivities(wcif) : [];
  const multistage = stages.length > 1;

  // All activities that relate to the ongoing activities
  const childActivities = roundActivities
    ?.flatMap((activity) => getAllChildActivities(activity))
    .filter((ca) => ongoingActivities.some((oa) => oa.id === ca.id));

  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivities = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId),
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const stage = stages.find((stage) =>
        stage.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id)),
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
  const { childActivities, personsInActivities, liveActivities } = useCommon(competitionId);
  const now = useNow();

  return (
    <div className="grid grid-cols-12 space-y-2">
      <div className="grid grid-cols-12 col-span-full gap-x-4">
        <div className="col-span-6 p-1 font-bold">Activity</div>
        <div className="col-span-3 p-1 font-bold">Started</div>
        <div className="col-span-3 p-1 font-bold">Duration</div>
        {childActivities?.map((activity) => {
          const liveActivity = liveActivities?.find((la) => la.activityId === activity.id);
          if (!liveActivity) {
            return null;
          }
          const { minutes, hours } = intervalToDuration({
            start: new Date(liveActivity.startTime),
            end: now,
          });
          const duration = formatDuration({ hours, minutes });

          return (
            <Fragment key={activity.id}>
              {/* {multistage && <div className="col-span-3">{activity.room?.name}:</div>} */}
              <div className="col-span-6 p-1">{activity.name}</div>
              <div className="col-span-3 p-1">{formatTime(liveActivity.startTime!)}</div>
              <div className="col-span-3 p-1">{minutes ? duration : 'now'}</div>
            </Fragment>
          );
        })}
      </div>

      <hr className="col-span-full" />

      {GroupAssignmentCodeRank.filter((assignmentCode) =>
        personsInActivities?.some((person) => person.assignment?.assignmentCode === assignmentCode),
      ).map((assignmentCode) => (
        <Fragment key={assignmentCode}>
          <AssignmentCodeCell
            as="div"
            border
            assignmentCode={assignmentCode}
            className="px-2 py-1 font-bold type-heading drop-shadow-lg col-span-full"
          />
          {childActivities.map((ca) => {
            const personsInActivity = personsInActivities?.filter(
              (person) =>
                person.activity?.id === ca.id &&
                person.assignment?.assignmentCode === assignmentCode,
            );

            if (!personsInActivity || personsInActivity?.length === 0) {
              return null;
            }

            return (
              <div key={ca.id} className="grid grid-cols-2 col-span-full group">
                <div
                  className="col-span-1 px-2 py-1 transition duration-150 ease-in-out transform group-hover:bg-gray-100 dark:group-hover:bg-gray-700"
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
                        className="col-span-1 px-2 py-1 transition duration-150 ease-in-out transform hover:bg-gray-100 dark:hover:bg-gray-700">
                        {person.name}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
          <div className="w-2 col-span-full" />
        </Fragment>
      ))}
    </div>
  );
};
