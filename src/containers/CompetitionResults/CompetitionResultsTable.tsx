import {
  AttemptResult,
  EventId,
  Person,
  RankingType,
  Result,
  Round,
  RoundFormat,
} from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { renderResultByEventId } from '@/lib/results';

interface CompetitionResultsTableProps {
  competitionId: string;
  eventId: string;
  round: Round;
  persons: Person[];
  LinkComponent?: LinkRenderer;
}

const getPrimaryRankingType = (format: RoundFormat): RankingType =>
  format === 'a' || format === 'm' ? 'average' : 'single';

const getResultValue = (result: Result, rankingType: RankingType) =>
  rankingType === 'average' ? result.average : result.best;

const renderResultValue = (eventId: string, rankingType: RankingType, result: Result) => {
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

export function CompetitionResultsTable({
  competitionId,
  eventId,
  round,
  persons,
  LinkComponent = AnchorLink,
}: CompetitionResultsTableProps) {
  const { t } = useTranslation();
  const primaryRankingType = getPrimaryRankingType(round.format);
  const attemptColumnCount = Math.max(0, ...round.results.map((result) => result.attempts.length));

  if (round.results.length === 0) {
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
        className="w-full min-w-[28rem] table-fixed md:min-w-[48rem]">
        <colgroup>
          <col className="w-12" />
          <col />
          {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
            <col key={attemptIndex} className="hidden w-16 md:table-column" />
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
              {t('competition.results.competitor')}
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
              {primaryRankingType === 'average'
                ? t('competition.results.average')
                : t('competition.results.best')}
            </th>
            <th scope="col" className="px-2 py-2 text-right">
              {t('competition.results.best')}
            </th>
          </tr>
        </thead>
        <tbody>
          {round.results.map((result) => {
            const person = persons.find((p) => p.registrantId === result.personId);
            const name =
              person?.name ??
              t('competition.results.unknownCompetitor', { personId: result.personId });

            return (
              <tr key={result.personId} className="border-b border-tertiary-weak last:border-b-0">
                <td className="bg-green-300 px-2 py-2 text-right type-body-sm tabular-nums text-gray-950 dark:bg-green-700 dark:text-white">
                  {result.ranking ?? '-'}
                </td>
                <td className="min-w-0 px-2 py-2">
                  {person ? (
                    <LinkComponent
                      to={`/competitions/${competitionId}/persons/${person.registrantId}`}
                      className="block truncate text-default hover-transition hover:text-primary">
                      {name}
                    </LinkComponent>
                  ) : (
                    <span className="block truncate">{name}</span>
                  )}
                </td>
                {Array.from({ length: attemptColumnCount }, (_, attemptIndex) => (
                  <td
                    key={attemptIndex}
                    className="hidden px-2 py-2 text-right tabular-nums md:table-cell">
                    {result.attempts[attemptIndex]
                      ? renderAttemptValue(eventId, result.attempts[attemptIndex].result)
                      : '-'}
                  </td>
                ))}
                <td className="px-2 py-2 text-right font-semibold tabular-nums">
                  {renderResultValue(eventId, primaryRankingType, result)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {renderResultValue(eventId, 'single', result)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
