import { AttemptResult, EventId } from '@wca/helpers';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
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

export function CompetitionPersonalResultsTable({
  competitionId,
  eventId,
  roundResults,
  LinkComponent,
}: CompetitionPersonalResultsTableProps) {
  const { t } = useTranslation();
  const attemptColumnCount = Math.max(0, ...roundResults.map((result) => result.attempts.length));

  return (
    <div className="w-full overflow-x-auto border border-tertiary-weak bg-panel shadow-md">
      <table
        aria-label={t('competition.personalResults.eventResults')}
        className="w-full min-w-0 table-fixed md:min-w-[48rem]">
        <colgroup>
          <col className="w-10" />
          <col />
          {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
            <col key={attemptIndex} className="hidden w-16 md:table-column" />
          ))}
          <col className="w-20 md:w-16" />
          <col className="w-20 md:w-16" />
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
                className="hidden px-2 py-2 text-right md:table-cell">
                {attemptIndex + 1}
              </th>
            ))}
            <th scope="col" className="px-2 py-2 text-right">
              {t('competition.results.average')}
            </th>
            <th scope="col" className="px-2 py-2 text-right">
              {t('competition.results.best')}
            </th>
          </tr>
        </thead>
        <tbody>
          {roundResults.map((result) => (
            <tr key={result.roundId} className="border-b border-tertiary-weak last:border-b-0">
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
                <LinkComponent
                  to={`/competitions/${competitionId}/results/${result.roundId}`}
                  className="block truncate text-primary hover-transition hover:text-primary-strong">
                  {result.roundName ??
                    t('common.activityCodeToName.round', { roundNumber: result.roundNumber })}
                </LinkComponent>
              </td>
              {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
                <td
                  key={attemptIndex}
                  className="hidden px-2 py-2 text-right tabular-nums md:table-cell">
                  {result.attempts[attemptIndex]
                    ? renderSingleResult(eventId, result.attempts[attemptIndex].result)
                    : '-'}
                </td>
              ))}
              <td className="px-2 py-2 text-right font-semibold tabular-nums">
                {renderAverageResult(eventId, result.average)}
              </td>
              <td className="px-2 py-2 text-right tabular-nums">
                {renderSingleResult(eventId, result.best)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { PersonalRoundResult };
