import { Competition, Person } from '@wca/helpers';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LinkButton } from '@/components/LinkButton';
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
      <div className="flex justify-between items-center min-h-10 px-1">
        <div className="flex flex-shrink items-center w-full space-x-1">
          {hasFlag(person.countryIso2) && (
            <div className="flex flex-shrink text-lg sm:text-xl mx-1">
              {getUnicodeFlagIcon(person.countryIso2)}
            </div>
          )}
          <h3 className="text-xl sm:text-2xl">{person.name}</h3>
        </div>
        <a
          className="text-md sm:text-lg hover:underline text-blue-600 w-48 font-mono"
          href={`https://www.worldcubeassociation.org/persons/${person.wcaId}`}
          target="_blank"
          rel="noreferrer">
          {person.wcaId}
          <i className="ml-2 fa fa-solid fa-arrow-up-right-from-square" />
        </a>
      </div>
      <hr className="my-2" />

      <table className="w-full text-sm">
        <thead className="bg-green-300 shadow-md">
          <tr>
            <th className="py-2 px-3">{t('competition.personalRecords.type')}</th>
            <th>{t('competition.personalRecords.best')}</th>
            <th>{t('common.wca.recordType.WR')}</th>
            <th>{t('common.wca.recordType.CR')}</th>
            <th>{t('common.wca.recordType.NR')}</th>
          </tr>
        </thead>
        <tbody>
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
                    <td colSpan={5} className="bg-green-200 py-2 px-3 text-center">
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
      <br />
      <div className="px-1 flex">
        <LinkButton
          color="blue"
          title={t('competition.personalRecords.viewSchedule')}
          to={`/competitions/${wcif.id}/persons/${person.registrantId}`}
        />
      </div>
    </>
  );
}
