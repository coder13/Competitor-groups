import { Person } from '@wca/helpers';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from '@/components/ExternalLink';
import { getPersonalResultsFromSources } from '@/containers/CompetitionResults/resultsProvider';
import { PersonalPageLayout } from '@/containers/PersonalSchedule/PersonalPageLayout';
import { useWcaLiveCompetitorLink, useWcaLiveCompetitorResults } from '@/hooks/queries/useWcaLive';
import { useWcaCompetitionResults } from '@/hooks/queries/useWcaResults';
import { isCompetitionDay } from '@/lib/competitionDates';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionPersonalResultsTable } from './CompetitionPersonalResultsTable';

export interface CompetitionPersonalResultsContainerProps {
  registrantId: string;
  LinkComponent?: LinkRenderer;
}

interface CompetitionPersonalResultsContentProps {
  person: Person;
  LinkComponent?: LinkRenderer;
}

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
  const { data: wcaApiResults, status: wcaApiResultsStatus } = useWcaCompetitionResults(
    competitionId,
    {
      enabled: Boolean(wcif),
    },
  );
  const isWcaApiResultsLoading = wcaApiResultsStatus === 'pending' && !wcaApiResults;

  const eventResults = useMemo(() => {
    if (!wcif) {
      return [];
    }

    return getPersonalResultsFromSources({
      wcif,
      person,
      wcaLiveResults,
      wcaApiResults,
    });
  }, [person, wcaApiResults, wcaLiveResults, wcif]);

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
                eventName={eventResult.eventName}
                person={person}
                roundResults={eventResult.rounds}
                LinkComponent={LinkComponent}
              />
            </section>
          ))}
        </div>
      ) : isWcaApiResultsLoading ? (
        <div className="rounded-md border border-tertiary-weak bg-panel p-4 text-muted">
          {t('common.loading')}
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
