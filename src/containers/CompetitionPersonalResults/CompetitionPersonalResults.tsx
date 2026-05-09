import { Competition, Person } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PersonalPageLayout } from '@/containers/PersonalSchedule/PersonalPageLayout';
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
  rounds: PersonalRoundResult[];
}

const getPersonalResults = (wcif: Competition, person: Person): EventResults[] =>
  wcif.events
    .map((event) => {
      const rounds = event.rounds
        .map((round, index) => {
          const result = round.results.find(
            (roundResult) => roundResult.personId === person.registrantId,
          );

          return result
            ? {
                round,
                roundNumber: index + 1,
                result,
              }
            : undefined;
        })
        .filter((roundResult): roundResult is PersonalRoundResult => Boolean(roundResult));

      return {
        eventId: event.id,
        eventName: getEventName(event.id, event),
        rounds,
      };
    })
    .filter((eventResults) => eventResults.rounds.length > 0);

export function CompetitionPersonalResultsContent({
  person,
  LinkComponent = AnchorLink,
}: CompetitionPersonalResultsContentProps) {
  const { t } = useTranslation();
  const { wcif, competitionId } = useWCIF();

  const eventResults = useMemo(
    () => (wcif && person ? getPersonalResults(wcif, person) : []),
    [person, wcif],
  );

  if (!wcif) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-4">
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
