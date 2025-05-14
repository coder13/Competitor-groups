import { Event, EventId } from '@wca/helpers';
import classNames from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import StickyBox from 'react-sticky-box';
import { Container } from '@/components/Container';
import { activityCodeToName } from '@/lib/activityCodes';
import { acceptedRegistration, isRegisteredForEvent } from '@/lib/person';
import { renderResultByEventId } from '@/lib/results';
import { byWorldRanking } from '@/lib/sort';
import { unique } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export const PsychSheetEvent = () => {
  const { t } = useTranslation();
  const { competitionId, eventId } = useParams<{
    competitionId: string;
    eventId: EventId;
  }>();

  const { wcif } = useWCIF();
  const navigate = useNavigate();

  const psychSheetBaseUrl = `/competitions/${competitionId}/psych-sheet`;

  const [urlSearchParams, setUrlSearchParams] = useSearchParams({
    resultType: 'average',
  });

  const resultType = useMemo(
    () => urlSearchParams.get('resultType') as 'average' | 'single',
    [urlSearchParams],
  );

  const persons = useMemo(
    () =>
      wcif?.persons.filter(
        (person) =>
          eventId && acceptedRegistration(person) && isRegisteredForEvent(eventId)(person),
      ) || [],
    [wcif, eventId],
  );

  // Creates a proper psychsheet with support for tied rankings
  const sortedPersons = useMemo(
    () =>
      eventId &&
      persons.sort(byWorldRanking(eventId)).map((person) => {
        return {
          ...person,
          pr: person.personalBests?.find(
            (pr) => pr.eventId === eventId && pr.type === (resultType || 'average'),
          ),
        };
      }),
    [eventId, persons, resultType],
  );

  const rankings = useMemo(
    () =>
      sortedPersons
        ?.map((person) => person.pr?.worldRanking ?? 0)
        .filter((i) => i > 0)
        .filter(unique) ?? [],
    [sortedPersons],
  );

  const gridCss = 'grid grid-cols-[3em_2em_1fr_min-content_7em] grid-rows-10';

  const handleEventChange = useCallback(
    (newEventId: EventId) => {
      navigate(
        `${psychSheetBaseUrl}/${newEventId}${
          urlSearchParams.toString() ? `?${urlSearchParams}` : ''
        }`,
      );
    },
    [navigate, psychSheetBaseUrl, urlSearchParams],
  );

  const handleResultTypeChange = useCallback(
    (newResultType: 'average' | 'single') => {
      setUrlSearchParams({
        resultType: newResultType,
      });
    },
    [setUrlSearchParams],
  );

  if (!eventId) {
    return null;
  }

  return (
    <Container className="w-full h-full">
      <div className={classNames('w-full h-full text-sm sm:text-base')}>
        <div className="flex p-1 space-x-2">
          <EventSelector value={eventId} events={wcif?.events || []} onChange={handleEventChange} />
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-40"
            value={resultType}
            onChange={(e) => handleResultTypeChange(e.target.value as 'average' | 'single')}>
            <option value="average">{t('common.wca.resultType.average')}</option>
            <option value="single">{t('common.wca.resultType.single')}</option>
          </select>
        </div>
        <StickyBox offsetTop={0} offsetBottom={0}>
          <div className={classNames('bg-green-300 w-full', gridCss)} role="rowheader">
            <span className="px-3 py-2.5 text-right font-bold">#</span>
            <span className="px-3 py-2.5 text-left"></span>
            <span className="px-3 py-2.5 text-left font-bold">
              {t('competition.rankings.name')}
            </span>
            <span className="px-3 py-2.5 text-right font-bold">
              {resultType === 'single'
                ? t('common.wca.resultType.single')
                : t('common.wca.resultType.average')}{' '}
            </span>
            <span className="px-3 py-2.5 text-right font-bold">{t('competition.rankings.WR')}</span>
          </div>
        </StickyBox>

        <div className={classNames(gridCss, 'striped')}>
          {sortedPersons?.map((person) => {
            const rank =
              (rankings?.findIndex((i) => i === person.pr?.worldRanking) >= 0
                ? rankings?.findIndex((i) => i === person.pr?.worldRanking)
                : rankings.length) + 1;

            const prAverage = person.personalBests?.find(
              (pr) => pr.eventId === eventId && pr.type === 'average',
            );

            return (
              <Link
                key={person.registrantId}
                className="contents"
                to={`/competitions/${wcif?.id}/personal-bests/${person.wcaId}`}>
                <span className="px-3 py-2.5 text-right flex items-center [font-variant-numeric:tabular-nums]">
                  {rank}
                </span>
                <span className="px-3 py-2.5 text-left flex items-center w-full">
                  {getUnicodeFlagIcon(person.countryIso2)}
                </span>
                <span className="px-3 py-2.5 text-left truncate">{person.name}</span>
                <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                  {prAverage ? renderResultByEventId(eventId, 'average', prAverage.best) : ''}
                </span>
                <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                  {prAverage
                    ? `${prAverage.worldRanking.toLocaleString([...navigator.languages])}`
                    : ''}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export const EventSelector = ({
  value,
  events,
  onChange,
}: {
  value: EventId;
  events: Event[];
  onChange: (eventId: EventId) => void;
}) => {
  return (
    <select
      id="events"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value as EventId)}>
      {events?.map((event) => (
        <option key={event.id} value={event.id}>
          {activityCodeToName(event.id)}
        </option>
      ))}
    </select>
  );
};
