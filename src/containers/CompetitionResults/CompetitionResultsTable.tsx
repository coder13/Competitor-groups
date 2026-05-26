import { AttemptResult, EventId, Person, RankingType, Round, RoundFormat } from '@wca/helpers';
import classNames from 'classnames';
import { KeyboardEvent, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { renderResultByEventId } from '@/lib/results';
import { ResultDetailsDialog } from './ResultDetailsDialog';
import { normalizeResultRecordTag, ResultRecordBadge, ResultRecordTag } from './ResultRecordBadge';
import { shouldOpenResultDetailsDialog } from './resultDetailsViewport';

export interface CompetitionRoundResult {
  id: string | number;
  personId: number | null;
  personName?: string;
  ranking: number | null;
  advancing: boolean;
  advancingQuestionable: boolean;
  attempts: {
    result: AttemptResult;
  }[];
  best: AttemptResult;
  average: AttemptResult;
  bestAttemptIndex?: number | null;
  worstAttemptIndex?: number | null;
  singleRecordTag?: ResultRecordTag;
  averageRecordTag?: ResultRecordTag;
}

interface CompetitionResultsTableProps {
  competitionId: string;
  eventId: string;
  round: Round;
  persons: Person[];
  results?: CompetitionRoundResult[];
  LinkComponent?: LinkRenderer;
}

type RoundResultWithRecords = Round['results'][number] & {
  regionalSingleRecord?: string | null;
  regionalAverageRecord?: string | null;
  singleRecordTag?: string | null;
  averageRecordTag?: string | null;
};

const getPrimaryRankingType = (format: RoundFormat): RankingType =>
  format === 'a' || format === 'm' ? 'average' : 'single';

const getResultValue = (result: CompetitionRoundResult, rankingType: RankingType) =>
  rankingType === 'average' ? result.average : result.best;

const renderResultValue = (
  eventId: string,
  rankingType: RankingType,
  result: CompetitionRoundResult,
) => {
  const value = getResultValue(result, rankingType);

  if (value === 0) {
    return '-';
  }

  return renderResultByEventId(eventId as EventId, rankingType, value);
};

const renderAttemptValue = (eventId: string, value: AttemptResult) => {
  if (value === 0) {
    return '-';
  }

  return renderResultByEventId(eventId as EventId, 'single', value);
};

const isAverageOfFiveRound = (format: RoundFormat) => format === 'a';

const isValidAttemptResult = (value: AttemptResult) => Number(value) > 0;

const getCalculatedDroppedAttemptIndexes = (
  attempts: CompetitionRoundResult['attempts'],
): Set<number> => {
  const validAttempts = attempts
    .map((attempt, index) => ({ index, value: Number(attempt.result) }))
    .filter((attempt) => attempt.value > 0);
  const completedAttempts = attempts
    .map((attempt, index) => ({ index, value: Number(attempt.result) }))
    .filter((attempt) => attempt.value !== 0);

  if (validAttempts.length === 0 || completedAttempts.length !== 5) {
    return new Set();
  }

  const bestAttempt = validAttempts.reduce((best, attempt) =>
    attempt.value < best.value ? attempt : best,
  );
  const worstAttempt = completedAttempts.reduce((worst, attempt) => {
    const attemptIsInvalid = !isValidAttemptResult(attempt.value);
    const worstIsInvalid = !isValidAttemptResult(worst.value);

    if (attemptIsInvalid && !worstIsInvalid) {
      return attempt;
    }

    if (attemptIsInvalid || worstIsInvalid) {
      return worst;
    }

    return attempt.value > worst.value ? attempt : worst;
  });

  return new Set([bestAttempt.index, worstAttempt.index]);
};

const getDroppedAttemptIndexes = (
  roundFormat: RoundFormat,
  result: CompetitionRoundResult,
): Set<number> => {
  if (!isAverageOfFiveRound(roundFormat) || result.attempts.length !== 5) {
    return new Set();
  }

  const providedIndexes = [result.bestAttemptIndex, result.worstAttemptIndex].filter(
    (index): index is number =>
      typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < 5,
  );

  return providedIndexes.length > 0
    ? new Set(providedIndexes)
    : getCalculatedDroppedAttemptIndexes(result.attempts);
};

const renderAttemptDisplayValue = (
  eventId: string,
  value: AttemptResult,
  isDroppedAttempt: boolean,
) => {
  const renderedValue = renderAttemptValue(eventId, value);

  return isDroppedAttempt && renderedValue !== '-' ? `(${renderedValue})` : renderedValue;
};

const getRecordTag = (result: CompetitionRoundResult, rankingType: RankingType) =>
  rankingType === 'average' ? result.averageRecordTag : result.singleRecordTag;

const ResultValue = ({
  children,
  recordTag,
}: {
  children: ReactNode;
  recordTag?: ResultRecordTag;
}) => (
  <span className="inline-grid grid-cols-[auto_1rem] items-baseline justify-end gap-1">
    <span className="text-right">{children}</span>
    <span className="flex w-4 justify-start">
      <ResultRecordBadge tag={recordTag} />
    </span>
  </span>
);

const isRosterOnlyResult = (result: CompetitionRoundResult) =>
  result.ranking == null &&
  result.attempts.length === 0 &&
  result.best === 0 &&
  result.average === 0;

const sortResultsByRanking = (results: CompetitionRoundResult[]) =>
  [...results].sort((a, b) => {
    if (a.ranking == null && b.ranking == null) {
      return 0;
    }

    if (a.ranking == null) {
      return 1;
    }

    if (b.ranking == null) {
      return -1;
    }

    return a.ranking - b.ranking;
  });

const toCompetitionRoundResult = (result: Round['results'][number]): CompetitionRoundResult => {
  const resultWithRecords = result as RoundResultWithRecords;

  return {
    id: result.personId,
    personId: result.personId,
    ranking: result.ranking,
    advancing: false,
    advancingQuestionable: false,
    attempts: result.attempts.map((attempt) => ({ result: attempt.result })),
    best: result.best,
    average: result.average,
    singleRecordTag: normalizeResultRecordTag(
      resultWithRecords.singleRecordTag ?? resultWithRecords.regionalSingleRecord,
    ),
    averageRecordTag: normalizeResultRecordTag(
      resultWithRecords.averageRecordTag ?? resultWithRecords.regionalAverageRecord,
    ),
  };
};

export function CompetitionResultsTable({
  competitionId,
  eventId,
  round,
  persons,
  results = round.results.map(toCompetitionRoundResult),
  LinkComponent = AnchorLink,
}: CompetitionResultsTableProps) {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<CompetitionRoundResult | null>(null);
  const primaryRankingType = getPrimaryRankingType(round.format);
  const attemptColumnCount = Math.max(0, ...results.map((result) => result.attempts.length));
  const sortedResults = sortResultsByRanking(results);

  const openDetailsDialog = (result: CompetitionRoundResult) => {
    if (!shouldOpenResultDetailsDialog()) {
      return;
    }

    setSelectedResult(result);
  };

  const openDetailsDialogFromKeyboard =
    (result: CompetitionRoundResult) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (!shouldOpenResultDetailsDialog()) {
        return;
      }

      event.preventDefault();
      setSelectedResult(result);
    };

  if (results.length === 0) {
    return (
      <div className="rounded-md border border-tertiary-weak bg-panel p-4 text-muted">
        {t('competition.results.noResults')}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-tertiary-weak bg-panel text-default">
      <table
        aria-label={t('competition.results.title')}
        className="w-full min-w-[22rem] table-fixed type-body-sm sm:min-w-[30rem] md:min-w-[56rem]">
        <colgroup>
          <col className="w-10 sm:w-12" />
          <col />
          {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
            <col key={attemptIndex} className="hidden w-24 md:table-column" />
          ))}
          <col className="w-20 sm:w-24" />
          <col className="w-20 sm:w-24" />
        </colgroup>
        <thead>
          <tr className="border-b border-tertiary-weak bg-gray-100 type-body-xs font-semibold text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <th scope="col" className="px-1 py-2 text-right sm:px-2">
              {t('competition.results.rank')}
            </th>
            <th scope="col" className="px-2 py-2 text-left">
              {t('competition.results.competitor')}
            </th>
            {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
              <th
                key={attemptIndex}
                scope="col"
                className="hidden whitespace-nowrap px-3 py-2 text-right text-gray-600 dark:text-gray-300 md:table-cell">
                {attemptIndex + 1}
              </th>
            ))}
            <th
              scope="col"
              className="border-l-2 border-tertiary px-2 py-2 text-right sm:px-3 md:px-2">
              {primaryRankingType === 'average'
                ? t('competition.results.average')
                : t('competition.results.best')}
            </th>
            <th scope="col" className="px-2 py-2 text-right sm:px-3 md:px-2">
              {t('competition.results.best')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result) => {
            const person = persons.find((p) => p.registrantId === result.personId);
            const name =
              person?.name ??
              result.personName ??
              t('competition.results.unknownCompetitor', { personId: result.personId });
            const isRosterOnly = isRosterOnlyResult(result);
            const droppedAttemptIndexes = getDroppedAttemptIndexes(round.format, result);

            return (
              <tr
                key={result.id}
                className="cursor-pointer border-b border-tertiary-weak hover-transition hover:bg-gray-50 last:border-b-0 dark:hover:bg-gray-700 md:cursor-default"
                tabIndex={0}
                onClick={() => openDetailsDialog(result)}
                onKeyDown={openDetailsDialogFromKeyboard(result)}>
                <td
                  className={classNames(
                    'px-1 py-2 text-right tabular-nums sm:px-2',
                    result.advancing &&
                      !result.advancingQuestionable &&
                      'bg-green-300 text-gray-950 dark:bg-green-700 dark:text-white',
                    result.advancingQuestionable &&
                      'bg-yellow-200 text-gray-950 dark:bg-yellow-500 dark:text-gray-950',
                  )}>
                  {result.ranking ?? (isRosterOnly ? '' : '-')}
                </td>
                <td className="min-w-0 px-2 py-2">
                  {person && result.personId ? (
                    <>
                      <span className="block truncate md:hidden">{name}</span>
                      <LinkComponent
                        to={`/competitions/${competitionId}/persons/${person.registrantId}/results`}
                        className="hidden truncate text-default hover-transition hover:text-primary md:block">
                        {name}
                      </LinkComponent>
                    </>
                  ) : (
                    <span className="block truncate">{name}</span>
                  )}
                </td>
                {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
                  <td
                    key={attemptIndex}
                    className="hidden whitespace-nowrap px-3 py-2 text-right text-gray-700 tabular-nums dark:text-gray-300 md:table-cell">
                    {result.attempts[attemptIndex]
                      ? renderAttemptDisplayValue(
                          eventId,
                          result.attempts[attemptIndex].result,
                          droppedAttemptIndexes.has(attemptIndex),
                        )
                      : isRosterOnly
                        ? ''
                        : '-'}
                  </td>
                ))}
                <td className="border-l-2 border-tertiary bg-gray-50 px-2 py-2 text-right font-semibold tabular-nums dark:bg-gray-900/50 sm:px-3 md:px-2">
                  {isRosterOnly ? (
                    ''
                  ) : (
                    <ResultValue recordTag={getRecordTag(result, primaryRankingType)}>
                      {renderResultValue(eventId, primaryRankingType, result)}
                    </ResultValue>
                  )}
                </td>
                <td className="bg-gray-50 px-2 py-2 text-right tabular-nums dark:bg-gray-900/50 sm:px-3 md:px-2">
                  {isRosterOnly ? (
                    ''
                  ) : (
                    <ResultValue
                      recordTag={
                        primaryRankingType === 'average' ? result.singleRecordTag : undefined
                      }>
                      {renderResultValue(eventId, 'single', result)}
                    </ResultValue>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedResult &&
        (() => {
          const person = persons.find((p) => p.registrantId === selectedResult.personId);
          const name =
            person?.name ??
            selectedResult.personName ??
            t('competition.results.unknownCompetitor', { personId: selectedResult.personId });

          return (
            <ResultDetailsDialog
              competitionId={competitionId}
              eventId={eventId}
              name={name}
              person={person}
              primaryRankingType={primaryRankingType}
              result={selectedResult}
              LinkComponent={LinkComponent}
              onClose={() => setSelectedResult(null)}
            />
          );
        })()}
    </div>
  );
}
