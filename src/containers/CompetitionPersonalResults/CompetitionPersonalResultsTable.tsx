import { AttemptResult, EventId, Person } from '@wca/helpers';
import classNames from 'classnames';
import { KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CompetitionRoundResult } from '@/containers/CompetitionResults/CompetitionResultsTable';
import { ResultDetailsDialog } from '@/containers/CompetitionResults/ResultDetailsDialog';
import { shouldOpenResultDetailsDialog } from '@/containers/CompetitionResults/resultDetailsViewport';
import { LinkRenderer } from '@/lib/linkRenderer';
import { renderResultByEventId } from '@/lib/results';

interface PersonalRoundResult {
  roundId: string;
  roundName?: string;
  roundNumber: number;
  ranking: number | null;
  advancing: boolean;
  advancingQuestionable: boolean;
  attempts: {
    result: AttemptResult;
  }[];
  best: AttemptResult;
  average: AttemptResult;
}

interface CompetitionPersonalResultsTableProps {
  competitionId: string;
  eventId: string;
  eventName: string;
  person: Person;
  roundResults: PersonalRoundResult[];
  LinkComponent: LinkRenderer;
}

const renderSingleResult = (eventId: string, value: AttemptResult) => {
  if (value === 0) {
    return '-';
  }

  return renderResultByEventId(eventId as EventId, 'single', value);
};

const renderAverageResult = (eventId: string, value: AttemptResult) => {
  if (value === 0) {
    return '-';
  }

  return renderResultByEventId(eventId as EventId, 'average', value);
};

const toCompetitionRoundResult = (result: PersonalRoundResult): CompetitionRoundResult => ({
  id: result.roundId,
  personId: null,
  ranking: result.ranking,
  advancing: result.advancing,
  advancingQuestionable: result.advancingQuestionable,
  attempts: result.attempts,
  best: result.best,
  average: result.average,
});

export function CompetitionPersonalResultsTable({
  competitionId,
  eventId,
  eventName,
  person,
  roundResults,
  LinkComponent,
}: CompetitionPersonalResultsTableProps) {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<PersonalRoundResult | null>(null);
  const attemptColumnCount = Math.max(0, ...roundResults.map((result) => result.attempts.length));
  const getRoundName = (result: PersonalRoundResult) =>
    result.roundName ?? t('common.activityCodeToName.round', { roundNumber: result.roundNumber });
  const openDetailsDialog = (result: PersonalRoundResult) => {
    if (!shouldOpenResultDetailsDialog()) {
      return;
    }

    setSelectedResult(result);
  };

  const openDetailsDialogFromKeyboard =
    (result: PersonalRoundResult) => (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (!shouldOpenResultDetailsDialog()) {
        return;
      }

      event.preventDefault();
      setSelectedResult(result);
    };

  return (
    <div className="w-full overflow-x-auto border border-tertiary-weak bg-panel shadow-md">
      <table
        aria-label={t('competition.personalResults.eventResults')}
        className="w-full min-w-0 table-fixed md:min-w-[48rem]">
        <colgroup>
          <col className="w-10" />
          <col />
          {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
            <col key={attemptIndex} className="hidden w-20 md:table-column" />
          ))}
          <col className="w-20" />
          <col className="w-20" />
        </colgroup>
        <thead>
          <tr className="border-b border-tertiary-weak type-body-xs font-semibold">
            <th scope="col" className="px-2 py-2 text-right">
              {t('competition.results.rank')}
            </th>
            <th scope="col" className="px-2 py-2 text-left">
              {t('common.wca.round')}
            </th>
            {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
              <th
                key={attemptIndex}
                scope="col"
                className="hidden px-4 py-2 text-right md:table-cell">
                {attemptIndex + 1}
              </th>
            ))}
            <th scope="col" className="px-4 py-2 text-right">
              {t('competition.results.average')}
            </th>
            <th scope="col" className="px-4 py-2 text-right">
              {t('competition.results.best')}
            </th>
          </tr>
        </thead>
        <tbody>
          {roundResults.map((result) => (
            <tr
              key={result.roundId}
              className="cursor-pointer border-b border-tertiary-weak hover-transition hover:bg-gray-50 last:border-b-0 dark:hover:bg-gray-800 md:cursor-default"
              tabIndex={0}
              onClick={() => openDetailsDialog(result)}
              onKeyDown={openDetailsDialogFromKeyboard(result)}>
              <td
                className={classNames(
                  'px-2 py-2 text-right type-body-sm tabular-nums',
                  result.advancing &&
                    !result.advancingQuestionable &&
                    'bg-green-300 text-gray-950 dark:bg-green-700 dark:text-white',
                  result.advancingQuestionable &&
                    'bg-yellow-200 text-gray-950 dark:bg-yellow-500 dark:text-gray-950',
                )}>
                {result.ranking ?? '-'}
              </td>
              <td className="min-w-0 px-2 py-2">
                <span className="block truncate md:hidden">{getRoundName(result)}</span>
                <LinkComponent
                  to={`/competitions/${competitionId}/results/${result.roundId}`}
                  className="hidden truncate text-primary hover-transition hover:text-primary-strong md:block">
                  {getRoundName(result)}
                </LinkComponent>
              </td>
              {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
                <td
                  key={attemptIndex}
                  className="hidden px-4 py-2 text-right tabular-nums md:table-cell">
                  {result.attempts[attemptIndex]
                    ? renderSingleResult(eventId, result.attempts[attemptIndex].result)
                    : '-'}
                </td>
              ))}
              <td className="px-4 py-2 text-right font-semibold tabular-nums">
                {renderAverageResult(eventId, result.average)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums">
                {renderSingleResult(eventId, result.best)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedResult && (
        <ResultDetailsDialog
          competitionId={competitionId}
          eventId={eventId}
          name={person.name}
          title={
            selectedResult.ranking ? `#${selectedResult.ranking}` : getRoundName(selectedResult)
          }
          details={[
            {
              label: t('common.wca.event'),
              value: eventName,
            },
            {
              label: t('common.wca.round'),
              value: getRoundName(selectedResult),
              link: {
                label: t('competition.results.allResults'),
                to: `/competitions/${competitionId}/results/${selectedResult.roundId}`,
              },
            },
          ]}
          primaryRankingType="average"
          result={toCompetitionRoundResult(selectedResult)}
          LinkComponent={LinkComponent}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

export type { PersonalRoundResult };
