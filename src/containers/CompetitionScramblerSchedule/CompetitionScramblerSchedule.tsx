import flatMap from 'lodash.flatmap';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { BreakableActivityName, Container, ErrorFallback } from '@/components';
import { getAllActivities, getAllRoundActivities, getRooms } from '@/lib/activities';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { formatToWeekDay } from '@/lib/time';
import { groupBy } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionScramblerScheduleContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionScramblerScheduleContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionScramblerScheduleContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.scramblers.title'));
  }, [setTitle, t]);

  const rooms = useMemo(() => (wcif ? getRooms(wcif) : []), [wcif]);
  const [roomSelector, setRoomSelector] = useState(rooms?.[0]?.name);

  useEffect(() => {
    if (!rooms.some((room) => room.name === roomSelector)) {
      setRoomSelector(rooms?.[0]?.name);
    }
  }, [rooms, roomSelector]);

  const allRoundActivities = useMemo(
    () =>
      wcif
        ? getAllRoundActivities(wcif)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .filter((activity) => activity.childActivities.length !== 0)
            .filter((activity) => activity.room?.name === roomSelector)
        : [],
    [roomSelector, wcif],
  );
  const allActivities = useMemo(() => (wcif ? getAllActivities(wcif) : []), [wcif]);
  const getActivity = useCallback(
    (assignment) => allActivities.find(({ id }) => id === assignment.activityId),
    [allActivities],
  );

  const assignments = useMemo(
    () =>
      flatMap(wcif?.persons, (person) =>
        person.assignments
          .filter((assignment) => assignment.assignmentCode === 'staff-scrambler')
          .map((assignment) => ({
            ...assignment,
            personName: person.name,
            activity: getActivity(assignment),
          })),
      ),
    [getActivity, wcif?.persons],
  );

  const activitiesSplitAcrossDates = groupBy(
    allRoundActivities.map((activity) => ({
      ...activity,
      date: formatToWeekDay(new Date(activity.startTime)) || '???',
    })),
    (activity) => activity.date,
  );

  return (
    <Container>
      <div className="print:hidden">
        <div className="flex flex-col items-center">
          <p className="type-heading">{t('competition.scramblers.rooms')}</p>
          <div className="flex w-full flex-row justify-evenly p-4">
            {rooms.map((room) => (
              <div key={room.id} className="form-check" onClick={() => setRoomSelector(room.name)}>
                <input
                  className="form-check-input float-left mr-2 mt-1 h-4 w-4 appearance-none rounded-full border border-gray-300 bg-white bg-center bg-no-repeat bg-contain align-top transition duration-200 checked:border-blue-600 checked:bg-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                  type="radio"
                  name={`room-selector-${room.name}`}
                  id={`room-selector-${room.name}`}
                  checked={roomSelector === room.name}
                  onChange={() => {}}
                />
                <label
                  className="form-check-label inline-block cursor-pointer text-gray-800 dark:text-gray-200"
                  htmlFor={`room-selector-${room.name}`}>
                  {room.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden print:flex">
        {t('competition.scramblers.stage')}: {roomSelector}
      </div>
      <div className="table-container">
        <table className="table-base table-striped type-body-sm">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell-center w-60">Event</th>
              <th className="table-header-cell">{t('competition.scramblers.scramblers')}</th>
              <th className="table-header-cell print:hidden w-8"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(activitiesSplitAcrossDates).map(([date, activities]) => (
              <Fragment key={date}>
                <tr>
                  <td colSpan={6} className="table-row-group-header">
                    {date}
                  </td>
                </tr>
                {activities.map((activity) => (
                  <Fragment key={activity.id}>
                    <tr>
                      <td colSpan={3} className="table-cell">
                        <BreakableActivityName
                          activityCode={activity.activityCode}
                          activityName={activity.name}
                        />
                      </td>
                    </tr>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      {activity.childActivities.map((childActivity) => {
                        const { groupNumber } = parseActivityCodeFlexible(
                          childActivity.activityCode,
                        );

                        return (
                          <LinkComponent
                            key={childActivity.id}
                            to={`/competitions/${competitionId}/activities/${childActivity.id}`}
                            className="table-row-link">
                            <td className="table-cell">{`Group ${groupNumber}`}</td>
                            <td className="table-cell">
                              {assignments
                                .filter((assignment) => assignment.activityId === childActivity.id)
                                .sort((a, b) => a.personName.localeCompare(b.personName))
                                .map(({ personName }) => personName)
                                .join(', ')}
                            </td>
                            <td className="table-cell-sm print:hidden text-right">
                              <i className="type-meta fa fa-chevron-right" />
                            </td>
                          </LinkComponent>
                        );
                      })}
                    </ErrorBoundary>
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
