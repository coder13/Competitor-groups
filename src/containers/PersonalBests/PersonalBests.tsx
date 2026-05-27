import { Competition, Person } from '@wca/helpers';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { eventNameById } from '@/lib/events';
import { renderResultByEventId } from '@/lib/results';
import { Ranking } from './Ranking';

export interface PersonalBestsContainerProps {
  wcif: Competition;
  person: Person;
}

export function PersonalBestsContainer({ wcif, person }: PersonalBestsContainerProps) {
  const { t } = useTranslation();

  return (
    <>
      <table className="w-full type-body-sm">
        <thead className="bg-assignment-competitor shadow-md dark:shadow-none">
          <tr className="text-assignment-competitor">
            <th className="px-3 py-2">{t('competition.personalRecords.type')}</th>
            <th>{t('competition.personalRecords.best')}</th>
            <th>{t('common.wca.recordType.WR')}</th>
            <th>{t('common.wca.recordType.CR')}</th>
            <th>{t('common.wca.recordType.NR')}</th>
          </tr>
        </thead>
        <tbody className="dark:text-gray-100">
          {wcif.events
            .filter((event) => person?.registration?.eventIds.includes(event.id))
            .map((event) => {
              const eventId = event.id;

              const averagePb = person?.personalBests?.find(
                (p) => p.eventId === eventId && p.type === 'average',
              );
              const singlePb = person?.personalBests?.find(
                (p) => p.eventId === eventId && p.type === 'single',
              );

              return (
                <Fragment key={eventId}>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-2 text-center bg-assignment-competitor-muted">
                      <Link
                        key={eventId}
                        to={`/competitions/${wcif.id}/psych-sheet/${eventId}`}
                        className="underline">
                        {eventNameById(eventId)}
                      </Link>
                    </td>
                  </tr>
                  {singlePb && (
                    <tr>
                      <td className="px-3 py-2">{t('common.wca.resultType.single')}</td>
                      <td className="px-3 py-2 text-center">
                        {renderResultByEventId(eventId, 'single', singlePb.best)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.worldRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.continentalRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.nationalRanking} />
                      </td>
                    </tr>
                  )}
                  {averagePb && (
                    <tr>
                      <td className="px-3 py-2">{t('common.wca.resultType.average')}</td>
                      <td className="px-3 py-2 text-center">
                        {renderResultByEventId(eventId, 'average', averagePb.best)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.worldRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.continentalRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.nationalRanking} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
        </tbody>
      </table>
    </>
  );
}
