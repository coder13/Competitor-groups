import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import type { Decorator } from '@storybook/react';
import { InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { AppContext } from '@/providers/AppProvider';
import { AuthContext } from '@/providers/AuthProvider';
import { UserSettingsContext } from '@/providers/UserSettingsProvider/UserSettingsContext';

const competitionsQueryDocument = gql`
  query GetCompetitions {
    competitions {
      id
      name
      startDate
      endDate
      country
      __typename
    }
  }
`;

interface AppStorybookOptions {
  currentUser?: User | null;
  online?: boolean;
  pinnedCompetitions?: ApiCompetition[];
  competitionDetails?: ApiCompetition[];
  userCompetitions?: {
    upcoming_competitions: ApiCompetition[];
    ongoing_competitions: ApiCompetition[];
  };
  notifyCompetitions?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    country: string;
    __typename?: string;
  }[];
  upcomingCompetitionsPages?: CondensedApiCompetiton[][];
}

type AppStorybookParameters = AppStorybookOptions;

const buildStorybookQueryClient = ({
  competitionDetails,
  currentUser,
  userCompetitions,
  upcomingCompetitionsPages,
}: AppStorybookOptions) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  if (currentUser && userCompetitions) {
    queryClient.setQueryData(['userCompetitions'], {
      user: currentUser,
      upcoming_competitions: userCompetitions.upcoming_competitions,
      ongoing_competitions: userCompetitions.ongoing_competitions,
    });
  }

  competitionDetails?.forEach((competition) => {
    queryClient.setQueryData(['competition', competition.id], competition);
  });

  if (upcomingCompetitionsPages) {
    queryClient.setQueryData(['upcomingCompetitions'], {
      pages: upcomingCompetitionsPages,
      pageParams: upcomingCompetitionsPages.map((_, index) => index + 1),
    } satisfies InfiniteData<CondensedApiCompetiton[], number>);
  }

  return queryClient;
};

function AppStorybookProviders({
  currentUser,
  online,
  pinnedCompetitions,
  competitionDetails,
  userCompetitions,
  notifyCompetitions,
  upcomingCompetitionsPages,
  children,
}: AppStorybookOptions & { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      buildStorybookQueryClient({
        competitionDetails,
        currentUser,
        userCompetitions,
        upcomingCompetitionsPages,
      }),
    [competitionDetails, currentUser, upcomingCompetitionsPages, userCompetitions],
  );

  const competitionMocks = useMemo(
    () => [
      {
        request: {
          query: competitionsQueryDocument,
        },
        result: {
          data: {
            competitions: notifyCompetitions,
          },
        },
      },
    ],
    [notifyCompetitions],
  );

  window.localStorage.setItem('pinnedCompetitions', JSON.stringify(pinnedCompetitions || []));
  window.localStorage.setItem('user', JSON.stringify(currentUser || null));
  window.localStorage.setItem(
    'my.upcoming_competitions',
    JSON.stringify(userCompetitions?.upcoming_competitions || []),
  );
  window.localStorage.setItem(
    'my.ongoing_competitions',
    JSON.stringify(userCompetitions?.ongoing_competitions || []),
  );

  return (
    <MockedProvider mocks={competitionMocks} addTypename={false}>
      <QueryClientProvider client={queryClient}>
        <AppContext.Provider value={{ online: online ?? true }}>
          <AuthContext.Provider
            value={{
              user: currentUser || null,
              setUser: () => {},
              signIn: () => {},
              signOut: () => {},
              signInAs: () => {},
            }}>
            <UserSettingsContext.Provider
              value={{
                theme: 'light',
                setTheme: () => {},
                effectiveTheme: 'light',
              }}>
              <div className="min-h-screen bg-app p-4 text-default">{children}</div>
            </UserSettingsContext.Provider>
          </AuthContext.Provider>
        </AppContext.Provider>
      </QueryClientProvider>
    </MockedProvider>
  );
}

export const storybookAppUser: User = {
  id: 1001,
  name: 'Blake Thompson',
  email: '',
  wca_id: '2010THOM03',
  avatar: {
    url: 'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179.jpeg',
    thumb_url:
      'https://avatars.worldcubeassociation.org/uploads/user/avatar/2010THOM03/1526357179_thumb.jpeg',
  },
  delegate_status: 'delegate',
};

export const storybookPinnedCompetitions: ApiCompetition[] = [
  {
    id: 'SeattleSummerOpen2026',
    name: 'Seattle Summer Open 2026',
    short_name: 'Seattle Summer Open 2026',
    city: 'Seattle, Washington',
    country_iso2: 'US',
    start_date: '2026-05-03',
    end_date: '2026-05-04',
    announced_at: '2026-01-15T00:00:00Z',
    cancelled_at: '',
    latitude_degrees: 47.6205,
    longitude_degrees: -122.3493,
    venue_address: '305 Harrison St',
    venue_details: 'Main hall entrance is on the east side of the venue near Fisher Pavilion.',
    website: 'https://www.worldcubeassociation.org/competitions/SeattleSummerOpen2026',
    event_ids: ['333', '222'],
    organizers: [],
    delegates: [],
  },
];

export const storybookUserCompetitions = {
  upcoming_competitions: [
    {
      id: 'PortlandAutumn2026',
      name: 'Portland Autumn 2026',
      short_name: 'Portland Autumn 2026',
      city: 'Portland, Oregon',
      country_iso2: 'US',
      start_date: '2026-10-10',
      end_date: '2026-10-11',
      announced_at: '2026-05-01T00:00:00Z',
      cancelled_at: '',
      latitude_degrees: 45.5152,
      longitude_degrees: -122.6784,
      venue_address: '777 NE Martin Luther King Jr Blvd',
      venue_details: 'Hall B',
      website: 'https://www.worldcubeassociation.org/competitions/PortlandAutumn2026',
      event_ids: ['333', '222', '444'],
      organizers: [],
      delegates: [],
    },
  ],
  ongoing_competitions: storybookPinnedCompetitions,
};

export const storybookNotifyCompetitions = [
  {
    id: 'SeattleSummerOpen2026',
    name: 'Seattle Summer Open 2026',
    startDate: '2026-05-03',
    endDate: '2026-05-04',
    country: 'US',
    __typename: 'Competition',
  },
  {
    id: 'PortlandAutumn2026',
    name: 'Portland Autumn 2026',
    startDate: '2026-10-10',
    endDate: '2026-10-11',
    country: 'US',
    __typename: 'Competition',
  },
];

export const storybookUpcomingCompetitionsPages: CondensedApiCompetiton[][] = [
  [
    {
      id: 'TacomaSpring2026',
      name: 'Tacoma Spring 2026',
      short_name: 'Tacoma Spring 2026',
      start_date: '2026-05-20',
      end_date: '2026-05-21',
      city: 'Tacoma, Washington',
      country_iso2: 'US',
    },
    {
      id: 'VancouverSummer2026',
      name: 'Vancouver Summer 2026',
      short_name: 'Vancouver Summer 2026',
      start_date: '2026-06-11',
      end_date: '2026-06-12',
      city: 'Vancouver, British Columbia',
      country_iso2: 'CA',
    },
  ],
];

export const makeAppContainerDecorator = ({
  currentUser = storybookAppUser,
  online = true,
  pinnedCompetitions = storybookPinnedCompetitions,
  competitionDetails = storybookPinnedCompetitions,
  userCompetitions = storybookUserCompetitions,
  notifyCompetitions = storybookNotifyCompetitions,
  upcomingCompetitionsPages = storybookUpcomingCompetitionsPages,
}: AppStorybookOptions = {}) =>
  ((Story, context) => {
    const parameters = context.parameters as AppStorybookParameters;

    return (
      <AppStorybookProviders
        currentUser={parameters.currentUser ?? currentUser}
        online={parameters.online ?? online}
        pinnedCompetitions={parameters.pinnedCompetitions || pinnedCompetitions}
        competitionDetails={parameters.competitionDetails || competitionDetails}
        userCompetitions={parameters.userCompetitions || userCompetitions}
        notifyCompetitions={parameters.notifyCompetitions || notifyCompetitions}
        upcomingCompetitionsPages={
          parameters.upcomingCompetitionsPages || upcomingCompetitionsPages
        }>
        <Story args={context.args} />
      </AppStorybookProviders>
    );
  }) satisfies Decorator;
