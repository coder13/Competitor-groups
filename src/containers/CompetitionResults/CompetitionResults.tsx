import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { getEventName } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { findRoundWithEvent, getAllRoundsWithEvents } from '@/lib/rounds';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionResultsTable } from './CompetitionResultsTable';

export interface CompetitionResultsContainerProps {
  competitionId: string;
  selectedRoundId?: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionResultsContainer({
  competitionId,
  selectedRoundId,
  LinkComponent = AnchorLink,
}: CompetitionResultsContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

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
      roundOptions.reduce<
        {
          event: (typeof roundOptions)[number]['event'];
          rounds: typeof roundOptions;
        }[]
      >((groups, roundOption) => {
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
    return round && (round.roundNumber === 1 || round.round.results.length > 0) ? round : undefined;
  }, [selectedRoundId, wcif]);

  if (selectedRoundId) {
    return (
      <Container className="pt-4">
        <div className="flex flex-col space-y-4 p-2 type-body">
          <div>
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
                LinkComponent={LinkComponent}
              />
            </section>
          ) : (
            <section className="rounded-md border border-tertiary-weak bg-panel p-4">
              <p>{t('competition.results.roundNotFound')}</p>
            </section>
          )}
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
