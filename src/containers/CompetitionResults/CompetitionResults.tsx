import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { useWcaLiveRoundLink, useWcaLiveRoundResults } from '@/hooks/queries/useWcaLive';
import { isCompetitionDay } from '@/lib/competitionDates';
import { getEventName } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { findRoundWithEvent, getAllRoundsWithEvents } from '@/lib/rounds';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionResultsTable, CompetitionRoundResult } from './CompetitionResultsTable';

export interface CompetitionResultsContainerProps {
  competitionId: string;
  selectedRoundId?: string;
  LinkComponent?: LinkRenderer;
}

interface RoundOptionGroup {
  event: ReturnType<typeof getAllRoundsWithEvents>[number]['event'];
  rounds: ReturnType<typeof getAllRoundsWithEvents>;
}

function ResultsRoundNav({
  competitionId,
  groups,
  selectedRoundId,
  LinkComponent,
}: {
  competitionId: string;
  groups: RoundOptionGroup[];
  selectedRoundId?: string;
  LinkComponent: LinkRenderer;
}) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('common.wca.round')}
      className="hidden overflow-hidden rounded-md border border-tertiary-weak bg-panel shadow-sm md:sticky md:top-4 md:block">
      <div>
        {groups.map(({ event, rounds }) => (
          <div key={event.id} className="border-b border-tertiary-weak last:border-b-0">
            <div className="flex items-center gap-2 px-3 py-2 text-muted type-body-xs">
              <span className={`cubing-icon event-${event.id}`} aria-hidden="true" />
              <span className="truncate">{getEventName(event.id, event)}</span>
            </div>
            <div>
              {rounds.map(({ round, roundNumber }) => {
                const isSelected = round.id === selectedRoundId;

                return (
                  <LinkComponent
                    key={round.id}
                    to={`/competitions/${competitionId}/results/${round.id}`}
                    className={classNames(
                      'flex min-h-10 items-center gap-2 px-3 py-2 type-body-sm hover-transition hover:bg-gray-100 dark:hover:bg-gray-700',
                      {
                        'bg-active text-primary': isSelected,
                        'text-default': !isSelected,
                      },
                    )}>
                    <span className="flex-1 truncate">
                      {t('common.activityCodeToName.round', { roundNumber })}
                    </span>
                    {isSelected && <span className="fa fa-check text-primary" aria-hidden="true" />}
                  </LinkComponent>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function CompetitionResultsContainer({
  competitionId,
  selectedRoundId,
  LinkComponent = AnchorLink,
}: CompetitionResultsContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();
  const isTodayCompetitionDay = wcif ? isCompetitionDay(wcif) : false;

  useEffect(() => {
    setTitle(t('competition.results.title'));
  }, [setTitle, t]);

  const roundOptions = useMemo(
    () =>
      wcif
        ? getAllRoundsWithEvents(wcif).filter(
            ({ round, roundNumber }) => roundNumber === 1 || round.results.length > 0,
          )
        : [],
    [wcif],
  );
  const eventsWithResults = useMemo(
    () =>
      roundOptions.reduce<RoundOptionGroup[]>((groups, roundOption) => {
        const existingGroup = groups.find((group) => group.event.id === roundOption.event.id);

        if (existingGroup) {
          existingGroup.rounds.push(roundOption);
          return groups;
        }

        groups.push({
          event: roundOption.event,
          rounds: [roundOption],
        });
        return groups;
      }, []),
    [roundOptions],
  );
  const selectedRound = useMemo(() => {
    if (!wcif || !selectedRoundId) {
      return undefined;
    }

    const round = findRoundWithEvent(wcif, selectedRoundId);
    return round &&
      (round.roundNumber === 1 || round.round.results.length > 0 || isTodayCompetitionDay)
      ? round
      : undefined;
  }, [isTodayCompetitionDay, selectedRoundId, wcif]);
  const { data: wcaLiveRoundLink, status: wcaLiveRoundLinkStatus } = useWcaLiveRoundLink(
    competitionId,
    selectedRound?.event.id ?? '',
    selectedRound?.roundNumber ?? 1,
    { enabled: Boolean(selectedRound) && isTodayCompetitionDay },
  );
  const { data: wcaLiveRound } = useWcaLiveRoundResults(wcaLiveRoundLink, {
    enabled: isTodayCompetitionDay && wcaLiveRoundLinkStatus === 'success',
  });
  const liveRoundResults = useMemo<CompetitionRoundResult[]>(
    () =>
      wcaLiveRound?.results
        .filter((result) => result.attempts.length > 0)
        .map((result) => ({
          id: result.id,
          personId: result.person.registrantId,
          personName: result.person.name,
          ranking: result.ranking,
          advancing: result.advancing,
          advancingQuestionable: result.advancingQuestionable,
          attempts: result.attempts,
          best: result.best,
          average: result.average,
        })) ?? [],
    [wcaLiveRound],
  );

  if (selectedRoundId) {
    return (
      <Container className="pt-4">
        <div className="grid gap-4 p-2 type-body md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
          <ResultsRoundNav
            competitionId={competitionId}
            groups={eventsWithResults}
            selectedRoundId={selectedRoundId}
            LinkComponent={LinkComponent}
          />
          <div className="flex min-w-0 flex-col space-y-4">
            <div className="md:hidden">
              <LinkButton
                to={`/competitions/${competitionId}/results`}
                title={t('competition.results.back')}
                variant="light"
                LinkComponent={LinkComponent}
              />
            </div>

            {selectedRound ? (
              <section className="space-y-2">
                <h2 className="type-heading">
                  {getEventName(selectedRound.event.id, selectedRound.event)}{' '}
                  {t('common.activityCodeToName.round', {
                    roundNumber: selectedRound.roundNumber,
                  })}
                </h2>
                <CompetitionResultsTable
                  competitionId={competitionId}
                  eventId={selectedRound.event.id}
                  round={selectedRound.round}
                  persons={wcif?.persons ?? []}
                  results={liveRoundResults.length > 0 ? liveRoundResults : undefined}
                  LinkComponent={LinkComponent}
                />
              </section>
            ) : (
              <section className="rounded-md border border-tertiary-weak bg-panel p-4">
                <p>{t('competition.results.roundNotFound')}</p>
              </section>
            )}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="pt-4">
      <div className="flex flex-col space-y-4 p-2 type-body">
        <div className="grid gap-2">
          {eventsWithResults.map(({ event, rounds }) => (
            <div
              key={event.id}
              className="overflow-hidden rounded-md border border-tertiary-weak bg-panel">
              <div className="flex items-center gap-2 border-b border-tertiary-weak px-2 py-2 text-muted">
                <span className={`cubing-icon event-${event.id}`} aria-hidden="true" />
                <span className="type-body-sm">{getEventName(event.id, event)}</span>
              </div>
              {rounds.map(({ round, roundNumber }) => {
                const isSelected = round.id === selectedRoundId;

                return (
                  <LinkComponent
                    key={round.id}
                    to={`/competitions/${competitionId}/results/${round.id}`}
                    className={classNames(
                      'flex items-center gap-2 border-b border-tertiary-weak px-2 py-2 text-default hover-transition hover:bg-gray-100 last:border-b-0 dark:hover:bg-gray-700',
                      {
                        'bg-active': isSelected,
                      },
                    )}>
                    <span className="flex-1">
                      {t('common.activityCodeToName.round', { roundNumber })}
                    </span>
                    <span className="text-muted fa fa-chevron-right" aria-hidden="true" />
                  </LinkComponent>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
