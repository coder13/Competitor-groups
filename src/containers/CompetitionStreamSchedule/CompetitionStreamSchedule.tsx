import { parseActivityCode } from '@wca/helpers';
import { Fragment, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DisclaimerText } from '@/components';
import { getRoomData, streamActivities, streamPersonIds } from '@/lib/activities';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { formatDate, formatToParts } from '@/lib/time';
import { roundTime } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionStreamScheduleContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined,
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

export function CompetitionStreamScheduleContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionStreamScheduleContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    if (wcif) {
      setTitle(t('competition.streamSchedule.title'));
    }
  }, [wcif, setTitle, t]);

  const activities = wcif ? streamActivities(wcif) : [];
  const getPersonById = useCallback(
    (personId) => wcif?.persons.find(({ wcaUserId }) => wcaUserId === personId),
    [wcif],
  );
  const activitiesWithParsedDate = activities
    .map((activity) => ({
      ...activity,
      date: formatDate(new Date(activity.startTime)),
    }))
    .sort(byDate);
  const getActivitiesByDate = useCallback(
    (date: string) => activitiesWithParsedDate.filter((activity) => activity.date === date),
    [activitiesWithParsedDate],
  );
  const scheduleDays = activities
    .map((activity) => {
      const dateTime = new Date(activity.startTime);
      return {
        approxDateTime: dateTime.getTime(),
        date: formatDate(dateTime) || 'foo',
        dateParts: formatToParts(dateTime),
      };
    })
    .filter((value, index, array) => array.findIndex(({ date }) => date === value.date) === index)
    .sort((a, b) => a.approxDateTime - b.approxDateTime);

  if (!wcif) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col bg-app p-1">
      <DisclaimerText />
      <hr className="my-2 border-tertiary-weak" />

      {activities.length > 0 ? (
        <>
          <h4 className="type-heading mb-2 text-center">
            {t('competition.streamSchedule.subtitle')}
          </h4>
          <div className="table-container">
            <table className="table-base table-striped type-body-sm">
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
                        {dateParts.find((part) => part.type === 'weekday')?.value || date}
                      </td>
                    </tr>
                    {getActivitiesByDate(date)
                      .sort(byDate)
                      .map((activity) => {
                        const { eventId, roundNumber, groupNumber } = parseActivityCode(
                          activity.activityCode,
                        );
                        const venue = wcif.schedule.venues?.find((venueCandidate) =>
                          venueCandidate.rooms.some(
                            (room) => room.id === activity?.parent?.room?.id,
                          ),
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
                          <LinkComponent
                            key={activity.id}
                            className="table-row-link"
                            to={`/competitions/${competitionId}/activities/${activity.id}`}>
                            <td className="table-cell text-center">{startTime}</td>
                            <td className="table-cell text-center">
                              <span className={`cubing-icon event-${eventId} mx-1 type-body`} />
                            </td>
                            <td className="table-cell text-center">{roundNumber}</td>
                            <td className="table-cell text-center">{groupNumber || '*'}</td>
                            <td className="table-cell text-center">
                              <span
                                className="rounded-md px-[6px] py-[4px]"
                                style={{
                                  backgroundColor: roomData ? `${roomData.color}70` : 'inherit',
                                }}>
                                {roomData?.name}
                              </span>
                            </td>
                            <td className="table-cell text-center">
                              {streamPersonIds(activity)
                                .map(getPersonById)
                                .filter(Boolean)
                                .map((person) => (
                                  <p key={person!.registrantId}>{person!.name}</p>
                                ))}
                            </td>
                          </LinkComponent>
                        );
                      })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div>No Live Stream information</div>
      )}
    </div>
  );
}
