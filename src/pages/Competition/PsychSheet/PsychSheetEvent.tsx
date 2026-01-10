import { Event, EventId, Person, PersonalBest } from '@wca/helpers';
import classNames from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { findPR } from '@/lib/activities';
import { activityCodeToName } from '@/lib/activityCodes';
import { acceptedRegistration, isRegisteredForEvent } from '@/lib/person';
import { renderResultByEventId } from '@/lib/results';
import { byWorldRanking } from '@/lib/sort';
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
  const sortedPersons = useMemo(() => {
    if (!eventId || !persons.length) {
      return [];
    }

    const _findPr = findPR(eventId);
    return persons.sort(byWorldRanking(eventId, resultType)).reduce(
      (
        persons: (Person & {
          rank: number;
          mainRank: number;
          subRank: number;
          pr?: PersonalBest;
        })[],
        person,
        index,
      ) => {
        const lastPerson = index > 0 ? persons[index - 1] : undefined;

        const avgPr = _findPr(person.personalBests || [], 'average');
        const singlePr = _findPr(person.personalBests || [], 'single');

        const mainRank =
          (resultType === 'average' ? avgPr?.worldRanking : singlePr?.worldRanking) ?? 0;
        const subRank = singlePr?.worldRanking ?? 0;

        const rank =
          lastPerson && mainRank === lastPerson.mainRank && subRank === lastPerson.subRank
            ? lastPerson.rank
            : index + 1;

        return [
          ...persons,
          {
            ...person,
            mainRank,
            subRank,
            rank: rank,
            pr: resultType === 'average' ? avgPr : singlePr,
          },
        ];
      },
      [],
    );
  }, [eventId, persons, resultType]);

  const gridCss = 'grid grid-cols-[3.5em_2em_1fr_min-content_7em]';

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
      <div
        className={classNames('w-full h-full text-sm sm:text-base text-gray-900 dark:text-white')}>
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

        <div className={gridCss}>
          <div
            className={
              '[&>span]:bg-green-300 [&>span]:dark:bg-green-900 [&>span]:dark:text-white stickyGridHeader contents absolute'
            }
            role="rowheader">
            <span className="px-3 py-2.5 text-right font-bold">#</span>
            <span className="px-3 py-2.5 text-left" />
            <span className="px-3 py-2.5 text-left font-bold">
              {t('competition.rankings.name')}
            </span>
            <span className="px-3 py-2.5 text-right font-bold whitespace-nowrap">
              {resultType === 'single'
                ? t('common.wca.resultType.single')
                : t('common.wca.resultType.average')}{' '}
            </span>
            <span className="px-3 py-2.5 text-right font-bold">
              {t('common.wca.recordType.WR')}
            </span>
          </div>
          <div className="contents striped">
            {sortedPersons?.map((person) => {
              const prAverage = person.personalBests?.find(
                (pr) => pr.eventId === eventId && pr.type === resultType,
              );

              return (
                <Link
                  key={person.registrantId}
                  className="contents"
                  to={`/competitions/${wcif?.id}/personal-bests/${person.wcaId}`}>
                  <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                    {person.rank}
                  </span>
                  <span className="px-3 py-2.5 text-left flex items-center w-full">
                    {getUnicodeFlagIcon(person.countryIso2)}
                  </span>
                  <span className="px-3 py-2.5 text-left truncate">{person.name}</span>
                  <span className="px-3 py-2.5 text-right [font-variant-numeric:tabular-nums]">
                    {prAverage ? renderResultByEventId(eventId, resultType, prAverage.best) : ''}
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
