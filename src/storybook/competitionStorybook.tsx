import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import type { Decorator } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Competition } from '@wca/helpers';
import { ReactNode, useEffect, useMemo } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppContext } from '@/providers/AppProvider';
import { AuthContext } from '@/providers/AuthProvider';
import { WCIFContext } from '@/providers/WCIFProvider';
import {
  storybookCompetitionApiFixture,
  storybookCompetitionFixture,
  storybookCurrentUser,
  storybookOngoingActivitiesFixture,
} from './competitionFixtures';

const activitiesQueryDocument = gql`
  query Activities($competitionId: String!) {
    activities(competitionId: $competitionId) {
      activityId
      startTime
      endTime
    }
  }
`;

interface CompetitionStorybookOptions {
  competition?: Competition;
  competitionData?: ApiCompetition;
  currentUser?: User | null;
  ongoingActivities?: {
    activityId: number;
    startTime: string;
    endTime: string | null;
  }[];
  pinnedPersons?: number[];
}

export interface CompetitionStorybookParameters extends CompetitionStorybookOptions {
  competitionFixture?: Competition;
}

const createStorybookQueryClient = (competition: Competition, competitionData?: ApiCompetition) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  if (competitionData) {
    queryClient.setQueryData(['competition', competition.id], competitionData);
  }

  return queryClient;
};

const StorybookCompetitionProviders = ({
  competition,
  competitionData,
  currentUser,
  ongoingActivities,
  pinnedPersons,
  children,
}: CompetitionStorybookOptions & { children: ReactNode }) => {
  const queryClient = useMemo(
    () => createStorybookQueryClient(competition!, competitionData),
    [competition, competitionData],
  );

  const activitiesMocks = useMemo(
    () => [
      {
        request: {
          query: activitiesQueryDocument,
          variables: {
            competitionId: competition!.id,
          },
        },
        result: {
          data: {
            activities: ongoingActivities,
          },
        },
      },
    ],
    [competition, ongoingActivities],
  );

  window.localStorage.setItem(
    'pinnedPersons',
    JSON.stringify({
      [competition!.id]: pinnedPersons,
    }),
  );
  window.localStorage.setItem('pinnedCompetitions', JSON.stringify([]));

  return (
    <MockedProvider mocks={activitiesMocks} addTypename={false}>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ online: true }}>
          <AuthContext.Provider
            value={{
              user: currentUser || null,
              setUser: () => {},
              signIn: () => {},
              signOut: () => {},
              signInAs: () => {},
            }}>
            <WCIFContext.Provider
              value={{
                competitionId: competition!.id,
                wcif: competition!,
                setTitle: () => {},
              }}>
              <div className="min-h-screen bg-app p-4 text-default">{children}</div>
            </WCIFContext.Provider>
          </AuthContext.Provider>
        </AppContext.Provider>
      </QueryClientProvider>
    </MockedProvider>
  );
};

export const makeCompetitionContainerDecorator = ({
  competition = storybookCompetitionFixture,
  competitionData = storybookCompetitionApiFixture,
  currentUser = storybookCurrentUser,
  ongoingActivities = storybookOngoingActivitiesFixture,
  pinnedPersons = [2, 3],
}: CompetitionStorybookOptions = {}) =>
  ((Story, context) => {
    const parameters = context.parameters as CompetitionStorybookParameters;
    const resolvedCompetition =
      parameters.competitionFixture || parameters.competition || competition;
    const resolvedCompetitionData =
      parameters.competitionData || competitionData || storybookCompetitionApiFixture;
    const resolvedCurrentUser = parameters.currentUser ?? currentUser ?? storybookCurrentUser;
    const resolvedOngoingActivities =
      parameters.ongoingActivities || ongoingActivities || storybookOngoingActivitiesFixture;
    const resolvedPinnedPersons = parameters.pinnedPersons || pinnedPersons || [2, 3];

    return (
      <StorybookCompetitionProviders
        competition={resolvedCompetition}
        competitionData={resolvedCompetitionData}
        currentUser={resolvedCurrentUser}
        ongoingActivities={resolvedOngoingActivities}
        pinnedPersons={resolvedPinnedPersons}>
        <Story args={context.args} />
      </StorybookCompetitionProviders>
    );
  }) satisfies Decorator;

function StorybookRouteDecorator({
  initialPath,
  routePath,
  children,
}: {
  initialPath: string;
  routePath: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(initialPath, { replace: true });
  }, [initialPath, navigate]);

  return (
    <Routes>
      <Route path={routePath} element={<>{children}</>} />
    </Routes>
  );
}

export const makeRouteDecorator = ({
  initialPath,
  routePath,
}: {
  initialPath: string;
  routePath: string;
}) =>
  ((Story, context) => (
    <StorybookRouteDecorator initialPath={initialPath} routePath={routePath}>
      <Story args={context.args} />
    </StorybookRouteDecorator>
  )) satisfies Decorator;
