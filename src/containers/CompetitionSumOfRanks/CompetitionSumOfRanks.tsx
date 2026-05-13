import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { Container } from '@/components/Container';
import { useWcaCompetitionResults } from '@/hooks/queries/useWcaResults';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';
import { SumOfRanksPersonRanking, getSumOfRanks } from './rankings';

export interface CompetitionSumOfRanksContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

const formatKinch = (kinch: number) => (kinch * 100).toFixed(2);

const formatMedals = (ranking: SumOfRanksPersonRanking) =>
  ranking.medals.length > 0
    ? `${ranking.medals.length} (${ranking.medals.map((medal) => medal.eventId).join(', ')})`
    : '';

function KinchTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      isOpen={open}
      positions={['bottom', 'left']}
      padding={8}
      onClickOutside={() => setOpen(false)}
      content={
        <div
          className={classNames(
            'z-1000 max-w-xs space-y-2 rounded border border-tertiary-weak bg-panel p-3 text-left type-body-sm text-default shadow-md transition-opacity duration-300 opacity-0',
            {
              'opacity-100': open,
            },
          )}>
          <p>Kinch is averaged across counted rounds.</p>
          <p>
            Each round compares the winning result to the competitor&apos;s result. Missed or
            invalid results count as 0.
          </p>
        </div>
      }>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        aria-label="Explain Kinch"
        onClick={() => setOpen((current) => !current)}>
        ?
      </button>
    </Popover>
  );
}

export function CompetitionSumOfRanksContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionSumOfRanksContainerProps) {
  const { wcif, setTitle } = useWCIF();
  const { data: wcaApiResults, status: wcaApiResultsStatus } = useWcaCompetitionResults(
    competitionId,
    {
      enabled: Boolean(wcif),
    },
  );

  useEffect(() => {
    setTitle(`${wcif?.name ?? competitionId} Sum of Rankings`);
  }, [competitionId, setTitle, wcif?.name]);

  const rankings = useMemo(
    () => (wcif ? getSumOfRanks(wcif, wcaApiResults) : []),
    [wcaApiResults, wcif],
  );
  const isLoadingResults = wcaApiResultsStatus === 'pending' && rankings.length === 0;
  const roundsCounted = rankings[0]?.roundsCounted ?? 0;
  const summary =
    rankings.length > 0
      ? `${rankings.length} competitors across ${roundsCounted} rounds`
      : 'No ranked rounds yet.';

  return (
    <Container className="mx-auto max-w-screen-lg space-y-4 p-2" fullWidth>
      <h1 className="type-heading">Sum of Rankings</h1>

      {!isLoadingResults && <div className="type-body-sm text-gray-600">{summary}</div>}

      {rankings.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200 shadow-sm">
          <table className="w-full table-auto whitespace-nowrap type-body">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2 text-right font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Competitor</th>
                <th className="px-3 py-2 text-right font-semibold">Sum</th>
                <th className="px-3 py-2 text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1">
                    Kinch
                    <KinchTooltip />
                  </span>
                </th>
                <th className="hidden px-3 py-2 text-right font-semibold md:table-cell">Medals</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking) => (
                <tr key={ranking.person.registrantId} className="border-t border-gray-200">
                  <td className="px-3 py-2 text-right">{ranking.position}</td>
                  <td className="px-3 py-2">
                    <LinkComponent
                      className="text-blue-600 hover:underline"
                      to={`/competitions/${competitionId}/persons/${ranking.person.registrantId}/results`}>
                      {ranking.person.name}
                    </LinkComponent>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{ranking.sumOfRanks}</td>
                  <td className="px-3 py-2 text-right">{formatKinch(ranking.kinch)}</td>
                  <td className="hidden px-3 py-2 text-right md:table-cell">
                    {formatMedals(ranking)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isLoadingResults && <div className="type-body text-gray-600">Loading results...</div>}
    </Container>
  );
}
