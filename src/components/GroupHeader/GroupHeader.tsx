import { Room, Round } from '@wca/helpers';
import { Fragment } from 'react';
import { ActivityRow } from '@/components';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { CutoffTimeLimitPanel } from '@/components/CutoffTimeLimitPanel';
import { hasActivities } from '@/lib/activities';
import { activityCodeToName } from '@/lib/activityCodes';
import { useWCIF } from '@/providers/WCIFProvider';

interface GroupHeaderProps {
  round?: Round;
  activityCode: string;
  rooms: Room[];
  children?: React.ReactNode;
}

export const GroupHeader = ({ round, activityCode, rooms, children }: GroupHeaderProps) => {
  const { competitionId } = useWCIF();

  const activityName = activityCodeToName(activityCode);
  const activityNameSplit = activityName.split(', ');

  const roundName = activityNameSplit.slice(0, 2).join(', ');
  const groupName = activityNameSplit ? activityNameSplit.slice(-1).join('') : undefined;

  return (
    <div className="p-2 space-y-2">
      <div className="space-x-1">
        <Breadcrumbs
          breadcrumbs={[
            {
              href: `/competitions/${competitionId}/events/${round?.id}`,
              label: roundName || '',
            },
            {
              label: groupName || '',
            },
          ]}
        />
      </div>

      {children}
      <div className="flex flex-col space-y-1">
        {round && <CutoffTimeLimitPanel round={round} className="" />}
      </div>
      <div className="flex flex-col -mx-2">
        {rooms?.filter(hasActivities(activityCode)).map((room) => {
          const activity = room.activities
            .flatMap((ra) => ra.childActivities)
            .find((a) => a.activityCode === activityCode);

          if (!activity) {
            return null;
          }
          const venue = room.venue;
          const timeZone = venue.timezone;

          return (
            <Fragment key={room.id}>
              {/* {multistage && <div className="col-span-1">{stage.name}:</div>}
              <div
                className={classNames({
                  'col-span-2': multistage,
                  'col-span-full': !multistage,
                })}>
                {activity && formatDateTimeRange(minStartTime, maxEndTime)}
              </div> */}
              <ActivityRow activity={activity} stage={room} timeZone={timeZone} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
