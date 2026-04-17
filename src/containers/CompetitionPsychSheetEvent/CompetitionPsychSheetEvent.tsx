import { Event, EventId, Person, PersonalBest } from '@wca/helpers';
import classNames from 'classnames';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { findPR } from '@/lib/activities';
import { activityCodeToName } from '@/lib/activityCodes';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { acceptedRegistration, isRegisteredForEvent } from '@/lib/person';
import { renderResultByEventId } from '@/lib/results';
import { byWorldRanking } from '@/lib/sort';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionPsychSheetEventContainerProps {
  competitionId: string;
  eventId: EventId;
  resultType: 'average' | 'single';
  onEventChange: (eventId: EventId) => void;
  onResultTypeChange: (resultType: 'average' | 'single') => void;
  LinkComponent?: LinkRenderer;
}

export function CompetitionPsychSheetEventContainer({
  competitionId,
  eventId,
  resultType,
  onEventChange,
  onResultTypeChange,
  LinkComponent = AnchorLink,
}: CompetitionPsychSheetEventContainerProps) {
  const { t } = useTranslation();
  const { wcif } = useWCIF();

  const persons = useMemo(
    () =>
      wcif?.persons.filter(
        (person) => acceptedRegistration(person) && isRegisteredForEvent(eventId)(person),
      ) || [],
    [wcif, eventId],
  );

  const sortedPersons = useMemo(() => {
    if (!persons.length) {
      return [];
    }

    const findPersonalRecord = findPR(eventId);

    return persons.sort(byWorldRanking(eventId, resultType)).reduce(
      (
        entries: (Person & {
          rank: number;
          mainRank: number;
          subRank: number;
          pr?: PersonalBest;
        })[],
        person,
        index,
      ) => {
        const lastPerson = index > 0 ? entries[index - 1] : undefined;
        const averagePr = findPersonalRecord(person.personalBests || [], 'average');
        const singlePr = findPersonalRecord(person.personalBests || [], 'single');
        const mainRank =
          (resultType === 'average' ? averagePr?.worldRanking : singlePr?.worldRanking) ?? 0;
        const subRank = singlePr?.worldRanking ?? 0;
        const rank =
          lastPerson && mainRank === lastPerson.mainRank && subRank === lastPerson.subRank
            ? lastPerson.rank
            : index + 1;

        return [
          ...entries,
          {
            ...person,
            mainRank,
            subRank,
            rank,
            pr: resultType === 'average' ? averagePr : singlePr,
          },
        ];
      },
      [],
    );
  }, [eventId, persons, resultType]);

  if (!eventId) {
    return null;
  }

  return (
    <Container className="h-full w-full">
      <div className="h-full w-full type-body">
        <div className="flex space-x-2 p-1">
          <EventSelector value={eventId} events={wcif?.events || []} onChange={onEventChange} />
          <select
            className="type-body-sm block w-40 rounded-lg border border-tertiary bg-tertiary p-2.5 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={resultType}
            onChange={(event) => onResultTypeChange(event.target.value as 'average' | 'single')}>
            <option value="average">{t('common.wca.resultType.average')}</option>
            <option value="single">{t('common.wca.resultType.single')}</option>
          </select>
        </div>

        <div className="grid grid-cols-[3.5em_2em_1fr_min-content_7em]">
          <div
            className="stickyGridHeader contents [&>span]:table-bg-header-secondary"
            role="rowheader">
            <span className="table-header-cell-sm text-right">#</span>
            <span className="table-header-cell-sm text-left" />
            <span className="table-header-cell-sm text-left">{t('competition.rankings.name')}</span>
            <span className="table-header-cell-sm whitespace-nowrap text-right">
              {resultType === 'single'
                ? t('common.wca.resultType.single')
                : t('common.wca.resultType.average')}{' '}
            </span>
            <span className="table-header-cell-sm text-right">{t('common.wca.recordType.WR')}</span>
          </div>
          <div className="contents">
            {sortedPersons.map((person, index) => {
              const prAverage = person.personalBests?.find(
                (personalBest) =>
                  personalBest.eventId === eventId && personalBest.type === resultType,
              );
              const isOdd = index % 2 === 1;

              return (
                <LinkComponent
                  key={person.registrantId}
                  className={classNames(
                    'contents [&>span]:transition-colors',
                    isOdd ? '[&>span]:table-bg-row-alt-secondary' : '[&>span]:table-bg-row',
                    '[&:hover>span]:table-bg-row-hover-secondary',
                  )}
                  to={`/competitions/${competitionId}/personal-bests/${person.wcaId}`}>
                  <span className="table-cell-sm text-right [font-variant-numeric:tabular-nums]">
                    {person.rank}
                  </span>
                  <span className="table-cell-sm flex w-full items-center text-left">
                    {getUnicodeFlagIcon(person.countryIso2)}
                  </span>
                  <span className="table-cell-sm truncate text-left">{person.name}</span>
                  <span className="table-cell-sm text-right [font-variant-numeric:tabular-nums]">
                    {prAverage ? renderResultByEventId(eventId, resultType, prAverage.best) : ''}
                  </span>
                  <span className="table-cell-sm text-right [font-variant-numeric:tabular-nums]">
                    {prAverage
                      ? `${prAverage.worldRanking.toLocaleString([...navigator.languages])}`
                      : ''}
                  </span>
                </LinkComponent>
              );
            })}
          </div>
        </div>
      </div>
    </Container>
  );
}

const EventSelector = ({
  value,
  events,
  onChange,
}: {
  value: EventId;
  events: Event[];
  onChange: (eventId: EventId) => void;
}) => (
  <select
    id="events"
    className="type-body-sm block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    value={value}
    onChange={(event) => onChange(event.target.value as EventId)}>
    {events.map((competitionEvent) => (
      <option key={competitionEvent.id} value={competitionEvent.id}>
        {activityCodeToName(competitionEvent.id)}
      </option>
    ))}
  </select>
);
