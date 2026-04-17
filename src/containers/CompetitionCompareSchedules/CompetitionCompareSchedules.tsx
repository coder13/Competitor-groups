import { AssignmentCode, Person } from '@wca/helpers';
import { Fragment, useMemo, useRef } from 'react';
import { Grid } from '@/components/Grid/Grid';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import {
  doesActivityOverlapInterval,
  getScheduledDays,
  getUniqueActivityTimes,
} from '@/lib/activities';
import Assignments from '@/lib/assignments';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { formatTime } from '@/lib/time';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionCompareSchedulesContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionCompareSchedulesContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionCompareSchedulesContainerProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { wcif } = useWCIF();

  const me = wcif?.persons.find((i) => i.wcaUserId === user?.id);
  const { pinnedPersons: pinnedRegistrantIds } = usePinnedPersons(competitionId);

  const pinnedPersons = pinnedRegistrantIds.map((id) =>
    wcif?.persons.find((p) => p.registrantId === id),
  );
  const persons = [me, ...pinnedPersons].filter(Boolean) as Person[];

  const scheduleDays = useMemo(() => wcif && getScheduledDays(wcif), [wcif]);
  const columnWidths = `repeat(${persons.length + 1}, minmax(5em, 1fr))`;
  const headerHeight = useMemo(
    () => (headerRef.current ? headerRef.current.clientHeight : 0),
    [headerRef],
  );

  return (
    <div className="type-body">
      <Grid
        columnWidths={columnWidths}
        className="[&>div]:px-3 [&>div]:py-2 [&>div]:text-center sticky top-0"
        ref={headerRef}>
        <div className="type-label z-50 bg-gray-100 text-center dark:bg-gray-800 dark:text-white">
          Time
        </div>
        {persons.map((person) => (
          <div
            key={person.wcaUserId}
            className="sticky top-0 z-50 bg-gray-100 dark:bg-gray-800 dark:text-white">
            <LinkComponent
              to={`/competitions/${competitionId}/persons/${person.registrantId}`}
              className="type-label dark:text-white">
              {person.name}
            </LinkComponent>
          </div>
        ))}
      </Grid>
      <Grid columnWidths={columnWidths} className="[&>div]:px-3 [&>div]:py-2 [&>div]:text-center">
        {scheduleDays?.map((day) => {
          const startTimes = getUniqueActivityTimes(day.activities);

          return (
            <Fragment key={day.date}>
              <div
                className="type-label sticky col-span-full bg-gray-100 dark:bg-gray-800 dark:text-white"
                style={{
                  top: headerHeight,
                }}>
                {day.date}
              </div>
              {startTimes.map((startTime, index) => {
                const endTime = startTimes[index + 1];

                if (!endTime) {
                  return null;
                }

                const activitiesHappeningDuringStartTime = day.activities.filter((activity) =>
                  doesActivityOverlapInterval(activity, startTime.startTime, endTime.startTime),
                );

                return (
                  <Fragment key={startTime.startTime}>
                    <div className="dark:text-white">{formatTime(startTime.startTime)}</div>
                    {persons.map((person) => {
                      const assignment = person.assignments?.find((candidate) =>
                        activitiesHappeningDuringStartTime.some(
                          (activity) => activity.id === candidate.activityId,
                        ),
                      );
                      const assignmentCode = assignment?.assignmentCode as AssignmentCode;

                      if (!assignmentCode) {
                        return (
                          <div
                            key={`${person.wcaUserId}-${startTime.startTime}`}
                            className="dark:text-white">
                            -
                          </div>
                        );
                      }

                      const config = Assignments.find((item) => item.id === assignmentCode);

                      return (
                        <div
                          key={`${person.wcaUserId}-${startTime.startTime}`}
                          className="dark:text-white"
                          style={{
                            backgroundColor: config && `${config.color}7f`,
                          }}>
                          {config ? config.key.toUpperCase() : assignmentCode[0].toUpperCase()}
                        </div>
                      );
                    })}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </Grid>
    </div>
  );
}
