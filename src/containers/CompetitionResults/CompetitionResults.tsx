import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { NoteBox } from '@/components/Notebox';
import {
  RoundActionPicker,
  RoundActionPickerEvent,
  RoundResultStatus,
  RoundResultStatusBadge,
} from '@/components/RoundActionPicker';
import { useWcaLiveRoundLink, useWcaLiveRoundResults } from '@/hooks/queries/useWcaLive';
import { useWcaCompetitionResults } from '@/hooks/queries/useWcaResults';
import { useNow } from '@/hooks/useNow';
import { getRoundActivitiesForRoundId } from '@/lib/activities';
import { isCompetitionDay } from '@/lib/competitionDates';
import { getEventName } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { findRoundWithEvent, getAllRoundsWithEvents } from '@/lib/rounds';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionResultsTable } from './CompetitionResultsTable';
import { getWcaApiResultsByRoundId } from './resultSources';
import { getRoundResultsFromSources } from './resultsProvider';

export interface CompetitionResultsContainerProps {
  competitionId: string;
  selectedRoundId?: string;
  LinkComponent?: LinkRenderer;
}

interface RoundOptionGroup {
  event: ReturnType<typeof getAllRoundsWithEvents>[number]['event'];
  rounds: ReturnType<typeof getAllRoundsWithEvents>;
}

const getRoundResultStatus = (
  round: RoundOptionGroup['rounds'][number]['round'],
  wcif: ReturnType<typeof useWCIF>['wcif'],
  now: Date,
  hasApiResults = false,
): RoundResultStatus => {
  const isRoundOngoing =
    wcif &&
    getRoundActivitiesForRoundId(wcif, round.id).some((activity) => {
      const start = new Date(activity.startTime);
      const end = new Date(activity.endTime);

      return start <= now && now < end;
    });

  if (isRoundOngoing) {
    return 'now';
  }

  if (round.results.length === 0 && !hasApiResults) {
    return undefined;
  }

  return 'done';
};

function ResultsRoundNav({
  competitionId,
  groups,
  selectedRoundId,
  LinkComponent,
  wcif,
  now,
  apiResultsByRoundId,
}: {
  competitionId: string;
  groups: RoundOptionGroup[];
  selectedRoundId?: string;
  LinkComponent: LinkRenderer;
  wcif: ReturnType<typeof useWCIF>['wcif'];
  now: Date;
  apiResultsByRoundId: Map<string, unknown[]>;
}) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('common.wca.round')}
      className="hidden overflow-y-auto rounded-md border border-tertiary-weak bg-panel shadow-sm md:sticky md:top-4 md:block md:max-h-[calc(100vh-2rem)]">
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
                const status = getRoundResultStatus(
                  round,
                  wcif,
                  now,
                  (apiResultsByRoundId.get(round.id)?.length ?? 0) > 0,
                );

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
                    {status && <RoundResultStatusBadge status={status} size="sm" />}
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
  const now = useNow(30 * 1000);
  const isTodayCompetitionDay = wcif ? isCompetitionDay(wcif) : false;
  const { data: wcaApiResults, status: wcaApiResultsStatus } = useWcaCompetitionResults(
    competitionId,
    {
      enabled: Boolean(wcif),
    },
  );
  const isWcaApiResultsLoading = wcaApiResultsStatus === 'pending' && !wcaApiResults;
  const apiResultsByRoundId = useMemo(
    () => (wcif && wcaApiResults ? getWcaApiResultsByRoundId(wcif, wcaApiResults) : new Map()),
    [wcaApiResults, wcif],
  );

  useEffect(() => {
    setTitle(t('competition.results.title'));
  }, [setTitle, t]);

  const roundOptions = useMemo(
    () =>
      wcif
        ? getAllRoundsWithEvents(wcif).filter(
            ({ round, roundNumber }) =>
              roundNumber === 1 ||
              round.results.length > 0 ||
              (apiResultsByRoundId.get(round.id)?.length ?? 0) > 0,
          )
        : [],
    [apiResultsByRoundId, wcif],
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
  const pickerEvents = useMemo<RoundActionPickerEvent[]>(
    () =>
      eventsWithResults.map(({ event, rounds }) => ({
        id: event.id,
        name: getEventName(event.id, event),
        rounds: rounds.map(({ round, roundNumber }) => ({
          id: round.id,
          roundNumber,
          resultStatus: getRoundResultStatus(
            round,
            wcif,
            now,
            (apiResultsByRoundId.get(round.id)?.length ?? 0) > 0,
          ),
          href: `/competitions/${competitionId}/results/${round.id}`,
        })),
      })),
    [apiResultsByRoundId, competitionId, eventsWithResults, now, wcif],
  );
  const selectedRound = useMemo(() => {
    if (!wcif || !selectedRoundId) {
      return undefined;
    }

    const round = findRoundWithEvent(wcif, selectedRoundId);
    return round &&
      (round.roundNumber === 1 ||
        round.round.results.length > 0 ||
        (apiResultsByRoundId.get(round.round.id)?.length ?? 0) > 0 ||
        isTodayCompetitionDay)
      ? round
      : undefined;
  }, [apiResultsByRoundId, isTodayCompetitionDay, selectedRoundId, wcif]);
  const { data: wcaLiveRoundLink, status: wcaLiveRoundLinkStatus } = useWcaLiveRoundLink(
    competitionId,
    selectedRound?.event.id ?? '',
    selectedRound?.roundNumber ?? 1,
    { enabled: Boolean(selectedRound) && isTodayCompetitionDay },
  );
  const { data: wcaLiveRound } = useWcaLiveRoundResults(wcaLiveRoundLink, {
    enabled: isTodayCompetitionDay && wcaLiveRoundLinkStatus === 'success',
  });
  const roundResults = useMemo(
    () => getRoundResultsFromSources({ wcif, selectedRound, wcaLiveRound, wcaApiResults }),
    [selectedRound, wcaApiResults, wcaLiveRound, wcif],
  );

  if (selectedRoundId) {
    return (
      <Container className="pt-4" fullWidth>
        <div className="mx-auto grid w-full max-w-screen-xl gap-4 p-2 type-body md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
          <ResultsRoundNav
            competitionId={competitionId}
            groups={eventsWithResults}
            selectedRoundId={selectedRoundId}
            LinkComponent={LinkComponent}
            wcif={wcif}
            now={now}
            apiResultsByRoundId={apiResultsByRoundId}
          />
          <div className="flex flex-col min-w-0 space-y-4">
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
                <NoteBox text={t('competition.results.liveResultsDelayNote')} />
                {isWcaApiResultsLoading && roundResults.length === 0 ? (
                  <section className="p-4 border rounded-md border-tertiary-weak bg-panel text-muted">
                    <p>{t('common.loading')}</p>
                  </section>
                ) : (
                  <CompetitionResultsTable
                    competitionId={competitionId}
                    eventId={selectedRound.event.id}
                    round={selectedRound.round}
                    persons={wcif?.persons ?? []}
                    results={roundResults}
                    LinkComponent={LinkComponent}
                  />
                )}
              </section>
            ) : isWcaApiResultsLoading ? (
              <section className="p-4 border rounded-md border-tertiary-weak bg-panel text-muted">
                <p>{t('common.loading')}</p>
              </section>
            ) : (
              <section className="p-4 border rounded-md border-tertiary-weak bg-panel">
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
      <div className="flex flex-col p-2 space-y-4 type-body">
        <NoteBox text={t('competition.results.liveResultsDelayNote')} />
        <RoundActionPicker mode="results" events={pickerEvents} LinkComponent={LinkComponent} />
      </div>
    </Container>
  );
}
