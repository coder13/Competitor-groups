import { AttemptResult, EventId, Person, RankingType, Round, RoundFormat } from '@wca/helpers';
import classNames from 'classnames';
import { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { renderResultByEventId } from '@/lib/results';
import { ResultDetailsDialog } from './ResultDetailsDialog';
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
}

interface CompetitionResultsTableProps {
  competitionId: string;
  eventId: string;
  round: Round;
  persons: Person[];
  results?: CompetitionRoundResult[];
  LinkComponent?: LinkRenderer;
}

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

export function CompetitionResultsTable({
  competitionId,
  eventId,
  round,
  persons,
  results = round.results.map((result) => ({
    id: result.personId,
    personId: result.personId,
    ranking: result.ranking,
    advancing: false,
    advancingQuestionable: false,
    attempts: result.attempts.map((attempt) => ({ result: attempt.result })),
    best: result.best,
    average: result.average,
  })),
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
    <div className="w-full overflow-x-auto border border-tertiary-weak bg-panel">
      <table
        aria-label={t('competition.results.title')}
        className="w-full min-w-[20rem] table-fixed type-body-sm sm:min-w-[28rem] md:min-w-[40rem]">
        <colgroup>
          <col className="w-10 sm:w-12" />
          <col />
          {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
            <col key={attemptIndex} className="hidden w-14 md:table-column" />
          ))}
          <col className="w-14 sm:w-16" />
          <col className="w-14 sm:w-16" />
        </colgroup>
        <thead>
          <tr className="border-b border-tertiary-weak type-body-xs font-semibold">
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
                className="hidden px-2 py-2 text-right md:table-cell md:px-1">
                {attemptIndex + 1}
              </th>
            ))}
            <th scope="col" className="px-1 py-2 text-right sm:px-2 md:px-1">
              {primaryRankingType === 'average'
                ? t('competition.results.average')
                : t('competition.results.best')}
            </th>
            <th scope="col" className="px-1 py-2 text-right sm:px-2 md:px-1">
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

            return (
              <tr
                key={result.id}
                className="cursor-pointer border-b border-tertiary-weak hover-transition hover:bg-gray-50 last:border-b-0 dark:hover:bg-gray-800 md:cursor-default"
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
                    className="hidden px-2 py-2 text-right tabular-nums md:table-cell md:px-1">
                    {result.attempts[attemptIndex]
                      ? renderAttemptValue(eventId, result.attempts[attemptIndex].result)
                      : isRosterOnly
                        ? ''
                        : '-'}
                  </td>
                ))}
                <td className="px-1 py-2 text-right font-semibold tabular-nums sm:px-2 md:px-1">
                  {isRosterOnly ? '' : renderResultValue(eventId, primaryRankingType, result)}
                </td>
                <td className="px-1 py-2 text-right tabular-nums sm:px-2 md:px-1">
                  {isRosterOnly ? '' : renderResultValue(eventId, 'single', result)}
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
