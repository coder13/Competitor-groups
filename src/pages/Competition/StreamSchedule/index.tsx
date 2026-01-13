import { parseActivityCode } from '@wca/helpers';
import { useCallback, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DisclaimerText } from '@/components';
import { getRoomData, streamActivities, streamPersonIds } from '@/lib/activities';
import { formatDate, formatToParts } from '@/lib/time';
import { roundTime } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined,
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

export default function CompetitionStreamSchedule() {
  const { t } = useTranslation();

  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    if (wcif) {
      setTitle(t('competition.streamSchedule.title'));
    }
  }, [wcif, setTitle, t]);

  const activities = wcif ? streamActivities(wcif) : [];

  const getPersonById = useCallback(
    (personId) => {
      return wcif?.persons.find(({ wcaUserId }) => wcaUserId === personId);
    },
    [wcif],
  );

  const activitiesWithParsedDate = activities
    .map((a) => ({
      ...a,
      date: formatDate(new Date(a.startTime)),
    }))
    .sort(byDate);

  const getActivitiesByDate = useCallback(
    (date) => {
      return activitiesWithParsedDate.filter((a) => a.date === date);
    },
    [activitiesWithParsedDate],
  );

  const scheduleDays = activities
    .map((a) => {
      const dateTime = new Date(a.startTime);
      return {
        approxDateTime: dateTime.getTime(),
        date: formatDate(dateTime) || 'foo',
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((v, i, arr) => arr.findIndex(({ date }) => date === v.date) === i)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  if (!wcif) {
    return <p>Loading...</p>;
  }

  const renderActivities = () => (
    <>
      <h4 className="mb-2 text-center type-heading">{t('competition.streamSchedule.subtitle')}</h4>
      <div className="table-container">
        <table className="table-base type-body-sm table-striped">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">{t('competition.streamSchedule.time')}</th>
              <th className="table-header-cell">{t('competition.streamSchedule.event')}</th>
              <th className="table-header-cell">{t('competition.streamSchedule.round')}</th>
              <th className="table-header-cell">{t('competition.streamSchedule.group')}</th>
              <th className="table-header-cell">{t('competition.streamSchedule.stage')}</th>
              <th className="table-header-cell">
                {t('competition.streamSchedule.featuredCompetitors')}
              </th>
            </tr>
          </thead>
          <tbody>
            {scheduleDays.map(({ date, dateParts }) => (
              <Fragment key={date}>
                <tr>
                  <td colSpan={6} className="table-row-group-header">
                    {dateParts.find((i) => i.type === 'weekday')?.value || date}
                  </td>
                </tr>
                {getActivitiesByDate(date)
                  .sort(byDate)
                  .map((activity) => {
                    const { eventId, roundNumber, groupNumber } = parseActivityCode(
                      activity.activityCode,
                    );

                    const venue = wcif.schedule.venues?.find((v) =>
                      v.rooms.some((r) => r.id === activity?.parent?.room?.id),
                    );
                    const timeZone = venue?.timezone;

                    const room = activity?.room || activity?.parent?.room;
                    const roomData = room && getRoomData(room, activity);

                    const startTime = roundTime(
                      new Date(activity?.startTime || 0),
                      5,
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone,
                    });

                    return (
                      <Link
                        key={`${activity.id}`}
                        className="table-row-link"
                        to={`/competitions/${wcif.id}/activities/${activity.id}`}>
                        <td className="table-cell text-center">{startTime}</td>
                        <td className="table-cell text-center">
                          <span className={`cubing-icon event-${eventId} mx-1 type-body`} />
                        </td>
                        <td className="table-cell text-center">{roundNumber}</td>
                        <td className="table-cell text-center">{groupNumber || '*'}</td>
                        <td className="table-cell text-center">
                          <span
                            className="px-[6px]  py-[4px]  rounded-md"
                            style={{
                              backgroundColor: roomData ? `${roomData.color}70` : 'inherit',
                            }}>
                            {roomData?.name}
                          </span>
                        </td>
                        <td className="table-cell text-center">
                          {streamPersonIds(activity)
                            .map(getPersonById)
                            .filter((person) => !!person)
                            .map((person) => (
                              <p key={person.registrantId}>{person!.name}</p>
                            ))}
                        </td>
                      </Link>
                    );
                  })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="flex flex-col p-1 bg-app">
      <DisclaimerText />
      <hr className="my-2 border-tertiary-weak" />

      {activities.length > 0 ? renderActivities() : <div>No Live Stream information</div>}
    </div>
  );
}
