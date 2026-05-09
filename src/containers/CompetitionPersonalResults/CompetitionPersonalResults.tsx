import { Competition, Person } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/ExternalLink';
import { PersonalPageLayout } from '@/containers/PersonalSchedule/PersonalPageLayout';
import {
  useWcaLiveCompetitorLink,
  useWcaLiveCompetitorResults,
  WcaLiveCompetitorResult,
} from '@/hooks/queries/useWcaLive';
import { isCompetitionDay } from '@/lib/competitionDates';
import { getEventName } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';
import {
  CompetitionPersonalResultsTable,
  PersonalRoundResult,
} from './CompetitionPersonalResultsTable';

export interface CompetitionPersonalResultsContainerProps {
  registrantId: string;
  LinkComponent?: LinkRenderer;
}

interface CompetitionPersonalResultsContentProps {
  person: Person;
  LinkComponent?: LinkRenderer;
}

interface EventResults {
  eventId: string;
  eventName: string;
  eventRank: number;
  rounds: PersonalRoundResult[];
}

const getPersonalResults = (wcif: Competition, person: Person): EventResults[] =>
  wcif.events
    .map((event, eventIndex) => {
      const rounds = event.rounds
        .map((round, index) => {
          const result = round.results.find(
            (roundResult) => roundResult.personId === person.registrantId,
          );

          return result
            ? {
                roundId: round.id,
                roundNumber: index + 1,
                ranking: result.ranking,
                advancing: false,
                advancingQuestionable: false,
                attempts: result.attempts.map((attempt) => ({ result: attempt.result })),
                best: result.best,
                average: result.average,
              }
            : undefined;
        })
        .filter((roundResult): roundResult is PersonalRoundResult => Boolean(roundResult));

      return {
        eventId: event.id,
        eventName: getEventName(event.id, event),
        eventRank: eventIndex,
        rounds,
      };
    })
    .filter((eventResults) => eventResults.rounds.length > 0);

const getLivePersonalResults = (
  wcif: Competition,
  liveResults: WcaLiveCompetitorResult[],
): EventResults[] => {
  const liveResultsWithAttempts = liveResults.filter((result) => result.attempts.length > 0);
  const eventIds = Array.from(
    new Set(liveResultsWithAttempts.map((result) => result.round.competitionEvent.event.id)),
  );

  return eventIds
    .map((eventId) => {
      const eventResults = liveResultsWithAttempts.filter(
        (result) => result.round.competitionEvent.event.id === eventId,
      );
      const firstResult = eventResults[0];
      const wcifEvent = wcif.events.find((event) => event.id === eventId);

      return {
        eventId,
        eventName: firstResult.round.competitionEvent.event.name,
        eventRank: firstResult.round.competitionEvent.event.rank,
        rounds: eventResults
          .sort((a, b) => a.round.number - b.round.number)
          .map((result) => ({
            roundId:
              wcifEvent?.rounds[result.round.number - 1]?.id ??
              `${eventId}-r${result.round.number}`,
            roundName: result.round.name,
            roundNumber: result.round.number,
            ranking: result.ranking,
            advancing: result.advancing,
            advancingQuestionable: result.advancingQuestionable,
            attempts: result.attempts,
            best: result.best,
            average: result.average,
          })),
      };
    })
    .sort((a, b) => a.eventRank - b.eventRank);
};

export function CompetitionPersonalResultsContent({
  person,
  LinkComponent = AnchorLink,
}: CompetitionPersonalResultsContentProps) {
  const { t } = useTranslation();
  const { wcif, competitionId } = useWCIF();
  const isTodayCompetitionDay = wcif ? isCompetitionDay(wcif) : false;
  const { data: wcaLiveLink, status: wcaLiveFetchStatus } = useWcaLiveCompetitorLink(
    competitionId,
    person.registrantId.toString(),
    { enabled: isTodayCompetitionDay },
  );
  const { data: wcaLiveResults } = useWcaLiveCompetitorResults(wcaLiveLink, {
    enabled: isTodayCompetitionDay && wcaLiveFetchStatus === 'success',
  });

  const eventResults = useMemo(() => {
    if (!wcif) {
      return [];
    }

    const liveEventResults = wcaLiveResults?.length
      ? getLivePersonalResults(wcif, wcaLiveResults)
      : [];

    return liveEventResults.length > 0 ? liveEventResults : getPersonalResults(wcif, person);
  }, [person, wcaLiveResults, wcif]);

  if (!wcif) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-4">
      {isTodayCompetitionDay && wcaLiveFetchStatus === 'success' && (
        <ExternalLink
          href={wcaLiveLink}
          className="rounded-md border border-tertiary-weak bg-panel px-3 py-2">
          {t('competition.results.viewLiveResults')}
        </ExternalLink>
      )}
      {eventResults.length > 0 ? (
        <div className="space-y-6">
          {eventResults.map((eventResult) => (
            <section key={eventResult.eventId} className="space-y-2">
              <h3 className="type-heading-sm">{eventResult.eventName}</h3>
              <CompetitionPersonalResultsTable
                competitionId={competitionId}
                eventId={eventResult.eventId}
                roundResults={eventResult.rounds}
                LinkComponent={LinkComponent}
              />
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-tertiary-weak bg-panel p-4 text-muted">
          {t('competition.results.noResults')}
        </div>
      )}
    </div>
  );
}

export function CompetitionPersonalResultsContainer({
  registrantId,
  LinkComponent = AnchorLink,
}: CompetitionPersonalResultsContainerProps) {
  const { t } = useTranslation();
  const { wcif, competitionId, setTitle } = useWCIF();

  const person = wcif?.persons.find((p) => p.registrantId.toString() === registrantId);

  useEffect(() => {
    if (person) {
      setTitle(`${person.name} ${t('competition.results.title')}`);
    }
  }, [person, setTitle, t]);

  if (!wcif || !person) {
    return null;
  }

  return (
    <PersonalPageLayout activePage="results" competitionId={competitionId} person={person}>
      <CompetitionPersonalResultsContent person={person} LinkComponent={LinkComponent} />
    </PersonalPageLayout>
  );
}
