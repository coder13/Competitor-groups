import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Container, ExternalLink, LinkButton } from '@/components';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { formatDateRange } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';
import { CompetitionFacts } from './CompetitionFacts';
import { UserListSection } from './UserListSection';
import { VenueInformation } from './VenueInformation';

export default function Information() {
  const { t } = useTranslation();
  const { setTitle, wcif } = useWCIF();
  const { competitionId = '' } = useParams<{ competitionId: string }>();

  const { data, error } = useCompetition(competitionId);

  useEffect(() => {
    setTitle('Information');
  }, [setTitle]);

  if (error) {
    return null;
  }

  return (
    <Container>
      <div className="flex flex-col w-full p-2 space-y-2 type-body">
        <div className="flex">
          <LinkButton
            to={`/competitions/${competitionId}/tabs`}
            title={t('competition.tabs.view')}
            variant="blue"
          />
        </div>
        <CompetitionFacts
          dateRange={
            data?.start_date && data?.end_date
              ? formatDateRange(data.start_date, data.end_date)
              : undefined
          }
          competitorLimit={wcif?.competitorLimit}
        />
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-200">
            Venue
          </p>
          <VenueInformation
            name={wcif?.schedule?.venues?.[0]?.name}
            address={data?.venue_address}
            city={data?.city}
            details={data?.venue_details}
            mapUrl={`https://maps.google.com/maps?q=${wcif?.schedule?.venues?.[0]?.name},${data?.venue_address},${data?.city}`}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-200">
            Organizers
          </p>
          <UserListSection users={data?.organizers} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-gray-200">
            Delegates
          </p>
          <UserListSection users={data?.delegates} />
        </div>
        <ExternalLink className="mt-2" href={data?.website || ''}>
          View WCA competition webpage
        </ExternalLink>
      </div>
    </Container>
  );
}
