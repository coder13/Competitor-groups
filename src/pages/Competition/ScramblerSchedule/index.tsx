import flatMap from 'lodash.flatmap';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BreakableActivityName, Container, ErrorFallback } from '@/components';
import { getAllActivities, getAllRoundActivities, getRooms } from '@/lib/activities';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { formatToWeekDay } from '@/lib/time';
import { groupBy } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export default function ScramblerSchedule() {
  const { t } = useTranslation();

  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.scramblers.title'));
  }, [setTitle, t]);

  const _rooms = useMemo(() => (wcif ? getRooms(wcif) : []), [wcif]);

  const [roomSelector, setRoomSelector] = useState(_rooms?.[0]?.name);

  useEffect(() => {
    if (!_rooms.some((room) => room.name === roomSelector)) {
      setRoomSelector(_rooms?.[0]?.name);
    }
  }, [_rooms, roomSelector]);

  const _allRoundActivities = useMemo(
    () =>
      wcif
        ? getAllRoundActivities(wcif)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .filter((activity) => activity.childActivities.length !== 0)
            .filter((activity) => activity.room?.name === roomSelector)
        : [],
    [roomSelector, wcif],
  );
  const _allActivities = useMemo(() => (wcif ? getAllActivities(wcif) : []), [wcif]);

  const getActivity = useCallback(
    (assignment) => _allActivities.find(({ id }) => id === assignment.activityId),
    [_allActivities],
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
    _allRoundActivities.map((activity) => ({
      ...activity,
      date: formatToWeekDay(new Date(activity.startTime)) || '???',
    })),
    (x) => x.date,
  );

  return (
    <Container>
      <div className="print:hidden">
        <div className="flex flex-col items-center">
          <p className="type-heading">{t('competition.scramblers.rooms')}</p>
          <div className="flex flex-row w-full p-4 justify-evenly">
            {_rooms.map((room) => (
              <div key={room.id} className="form-check" onClick={() => setRoomSelector(room.name)}>
                <input
                  className="float-left w-4 h-4 mt-1 mr-2 align-top transition duration-200 bg-white bg-center bg-no-repeat bg-contain border border-gray-300 rounded-full appearance-none dark:bg-gray-700 dark:border-gray-600 form-check-input checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                  type="radio"
                  name={`room-selector-${room.name}`}
                  id={`room-selector-${room.name}`}
                  checked={roomSelector === room.name}
                  onChange={() => {}}
                />
                <label
                  className="inline-block text-gray-800 cursor-pointer dark:text-gray-200 form-check-label"
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
        <table className="table-base type-body-sm table-striped">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell-center w-60">Event</th>
              <th className="table-header-cell">{t('competition.scramblers.scramblers')}</th>
              <th className="w-8 table-header-cell print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(activitiesSplitAcrossDates).map(([date, activities]) => (
              <Fragment key={date}>
                <tr className="">
                  <td colSpan={6} className="table-row-group-header">
                    {date}
                  </td>
                </tr>
                {activities.map((activity) => (
                  <>
                    <tr key={activity.id}>
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
                          <Link
                            key={childActivity.id}
                            to={`/competitions/${wcif?.id}/activities/${childActivity.id}`}
                            className="table-row-link">
                            <td className="table-cell">{`Group ${groupNumber}`}</td>
                            <td className="table-cell">
                              {assignments
                                .filter((a) => a.activityId === childActivity.id)
                                ?.sort((a, b) => a.personName.localeCompare(b.personName))
                                .map(({ personName }) => personName)
                                .join(', ')}
                            </td>
                            <td className="text-right table-cell-sm print:hidden">
                              <i className="type-meta fa fa-chevron-right" />
                            </td>
                          </Link>
                        );
                      })}
                    </ErrorBoundary>
                  </>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
