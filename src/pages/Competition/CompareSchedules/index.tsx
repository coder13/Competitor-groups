import { AssignmentCode, Person } from '@wca/helpers';
import { Fragment, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Grid } from '@/components/Grid/Grid';
import { usePinnedPersons } from '@/hooks/UsePinnedPersons';
import {
  doesActivityOverlapInterval,
  getScheduledDays,
  getUniqueActivityTimes,
} from '@/lib/activities';
import Assignments from '@/lib/assignments';
import { formatTime } from '@/lib/time';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

export default function CompareSchedules() {
  const headerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { wcif, competitionId } = useWCIF();

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
    <div>
      <Grid
        columnWidths={columnWidths}
        className="[&>div]:py-2 [&>div]:px-3 [&>div]:text-center sticky top-0"
        ref={headerRef}>
        <div className="z-50 font-bold text-center bg-gray-100">Time</div>
        {persons.map((p) => (
          <div key={p.wcaUserId} className="sticky top-0 z-50 bg-gray-100">
            <Link
              to={`/competitions/${competitionId}/persons/${p.registrantId}`}
              className="font-bold">
              {p.name}
            </Link>
          </div>
        ))}
      </Grid>
      <Grid columnWidths={columnWidths} className="[&>div]:py-2 [&>div]:px-3 [&>div]:text-center">
        {scheduleDays?.map((day) => {
          const startTimes = getUniqueActivityTimes(day.activities);

          return (
            <Fragment key={day.date}>
              <div
                className="sticky font-bold bg-gray-100 col-span-full"
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
                    <div>{formatTime(startTime.startTime)}</div>
                    {persons.map((p) => {
                      const assignment = p.assignments?.find((a) =>
                        activitiesHappeningDuringStartTime.some(
                          (activity) => activity.id === a.activityId,
                        ),
                      );
                      const assignmentCode = assignment?.assignmentCode as AssignmentCode;

                      if (!assignmentCode) {
                        return <div key={`${p.wcaUserId}-${startTime.startTime}`}>-</div>;
                      }

                      const config = Assignments.find((i) => i.id === assignmentCode);

                      return (
                        <div
                          key={`${p.wcaUserId}-${startTime.startTime}`}
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
