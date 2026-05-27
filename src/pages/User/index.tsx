import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';
import { Container } from '@/components';
import { useMyCompetitionsQuery } from '@/containers/MyCompetitions/MyCompetitions.query';
import { fetchPersonCompetitions, fetchWcif, WcaCompetitionResult, wcaApiFetch } from '@/lib/api';
import { FIVE_MINUTES } from '@/lib/constants';
import { useAuth } from '@/providers/AuthProvider';
import { CompetitionsTab } from './components/CompetitionsTab';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileTabs } from './components/ProfileTabs';
import { RecordsTab } from './components/RecordsTab';
import { ResultsTab } from './components/ResultsTab';
import { getPersonalRecords, UserPageTab, WcaPersonResponse } from './userProfileData';

const isUserPageTab = (tab: string | undefined): tab is UserPageTab =>
  tab === 'competitions' || tab === 'results' || tab === 'records';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

const getAssignmentStatus = async (
  competitions: ApiCompetition[],
  userId: number,
  queryClient: QueryClient,
) => {
  const statuses = await Promise.all(
    competitions.map(async (competition) => {
      try {
        const wcif = await queryClient.fetchQuery({
          queryKey: ['wcif', competition.id],
          queryFn: () => fetchWcif(competition.id),
          staleTime: FIVE_MINUTES,
          gcTime: ONE_DAY,
        });
        const person = wcif.persons.find((p) => p.wcaUserId === userId);

        return {
          competitionId: competition.id,
          hasAssignments: (person?.assignments?.length || 0) > 0,
        };
      } catch {
        return {
          competitionId: competition.id,
          hasAssignments: false,
        };
      }
    }),
  );

  return statuses.reduce<Record<string, boolean>>((acc, status) => {
    acc[status.competitionId] = status.hasAssignments;
    return acc;
  }, {});
};

export default function UserPage() {
  const { tab: tabParam, resultsMode: resultsModeParam } = useParams<{
    tab?: string;
    resultsMode?: string;
  }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tab = tabParam || 'competitions';
  const isCompetitionsTab = tab === 'competitions';
  const isResultsTab = tab === 'results';
  const isRecordsTab = tab === 'records';
  const { competitions, isLoading: isLoadingCompetitions } = useMyCompetitionsQuery(user?.id, {
    enabled: isCompetitionsTab,
  });
  const competitionIds = competitions.map((competition) => competition.id).join(',');

  const assignmentStatusQuery = useQuery({
    queryKey: ['user-assignment-status', user?.id, competitionIds],
    enabled: Boolean(isCompetitionsTab && user?.id && competitions.length > 0),
    queryFn: () => getAssignmentStatus(competitions, user!.id, queryClient),
    staleTime: FIVE_MINUTES,
  });

  const resultsQuery = useQuery({
    queryKey: ['user-results', user?.wca_id],
    enabled: Boolean(isResultsTab && user?.wca_id),
    queryFn: () => wcaApiFetch<WcaCompetitionResult[]>(`/persons/${user!.wca_id}/results`),
    staleTime: ONE_HOUR,
    gcTime: ONE_DAY,
  });

  const pastCompetitionsQuery = useQuery({
    queryKey: ['user-past-competitions', user?.wca_id],
    enabled: Boolean(isCompetitionsTab && user?.wca_id),
    queryFn: () => fetchPersonCompetitions(user!.wca_id),
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });

  const recordsQuery = useQuery({
    queryKey: ['user-profile', user?.wca_id],
    enabled: Boolean(user?.wca_id),
    queryFn: () => wcaApiFetch<WcaPersonResponse>(`/persons/${user!.wca_id}`),
    staleTime: isRecordsTab ? ONE_HOUR : ONE_DAY,
    gcTime: ONE_DAY,
  });

  if (!isUserPageTab(tab)) {
    return <Navigate to="/me/competitions" replace />;
  }

  if (tab !== 'results' && resultsModeParam) {
    return <Navigate to={`/me/${tab}`} replace />;
  }

  if (tab === 'results' && resultsModeParam) {
    return <Navigate to="/me/results" replace />;
  }

  if (!user) {
    return (
      <div className="flex min-h-0 w-full flex-1 justify-center overflow-y-auto">
        <Container className="px-4 py-8">
          <p className="type-body">Please log in to view your profile.</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 justify-center overflow-y-auto">
      <Container className="space-y-4 p-2 pt-4">
        <ProfileHeader countryIso2={recordsQuery.data?.person.country_iso2} user={user} />
        <ProfileTabs activeTab={tab} />

        {tab === 'competitions' && (
          <>
            {isLoadingCompetitions ? (
              <p className="type-body-sm text-muted">Loading competitions...</p>
            ) : (
              <CompetitionsTab
                competitions={competitions}
                assignmentStatus={assignmentStatusQuery.data}
                isCheckingAssignments={assignmentStatusQuery.isLoading}
                pastCompetitions={pastCompetitionsQuery.data}
                isLoadingPastCompetitions={pastCompetitionsQuery.isLoading}
                wcaId={user.wca_id}
              />
            )}
          </>
        )}

        {tab === 'results' && (
          <ResultsTab
            results={resultsQuery.data}
            isLoading={resultsQuery.isLoading}
            error={resultsQuery.error}
            wcaId={user.wca_id}
          />
        )}

        {tab === 'records' && (
          <RecordsTab
            records={getPersonalRecords(recordsQuery.data)}
            isLoading={recordsQuery.isLoading}
            error={recordsQuery.error}
          />
        )}
      </Container>
    </div>
  );
}
