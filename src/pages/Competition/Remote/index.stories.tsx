import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react';
import { ReactNode, useEffect } from 'react';
import { RemoteActivitiesDocument, RemoteCompetitionDocument } from '@/lib/notifyCompRemoteGraphql';
import { setNotifyCompWebSocketStatus } from '@/lib/notifyCompWebSocketStatus';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import {
  NotifyCompRemoteAuthContext,
  NotifyCompRemoteAuthContextValue,
} from '@/providers/NotifyCompRemoteAuthProvider/NotifyCompRemoteAuthContext';
import {
  storybookCompetitionFixture,
  storybookOngoingActivitiesFixture,
} from '@/storybook/competitionFixtures';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionRemote from './index';

const competitionId = storybookCompetitionFixture.id;

const remoteAdminUser: User = {
  id: 9001,
  name: 'Nick Silvestri',
  email: '',
  wca_id: '2016SILV08',
  avatar: {
    url: 'https://avatars.worldcubeassociation.org/nsg38gkpoch8xiji3hodmrs672m4',
    thumb_url: 'https://avatars.worldcubeassociation.org/uge6fzvlpmz6c8ztn8ey5wi4i8uf',
  },
  delegate_status: 'delegate',
};

const remoteAuthContext: NotifyCompRemoteAuthContextValue = {
  authenticating: false,
  error: null,
  isAuthenticated: true,
  isAuthenticatedForCompetition: () => true,
  signIn: async () => {},
  signOut: () => {},
  userName: remoteAdminUser.name,
};

const remoteMocks: MockedResponse[] = [
  {
    request: {
      query: RemoteCompetitionDocument,
      variables: {
        competitionId,
      },
    },
    result: {
      data: {
        competition: {
          id: competitionId,
          autoAdvance: true,
          autoAdvanceDelay: null,
        },
      },
    },
  },
  {
    request: {
      query: RemoteActivitiesDocument,
      variables: {
        competitionId,
        roomId: undefined,
      },
    },
    result: {
      data: {
        activities: storybookOngoingActivitiesFixture,
      },
    },
  },
];

function RemoteStoryProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    setNotifyCompWebSocketStatus({ status: 'connected' });

    return () => {
      setNotifyCompWebSocketStatus({ status: 'idle' });
    };
  }, []);

  return (
    <MockedProvider addTypename={false} mocks={remoteMocks}>
      <ConfirmProvider>
        <NotifyCompRemoteAuthContext.Provider value={remoteAuthContext}>
          {children}
        </NotifyCompRemoteAuthContext.Provider>
      </ConfirmProvider>
    </MockedProvider>
  );
}

const meta = {
  title: 'Pages/Competition/Remote',
  component: CompetitionRemote,
  decorators: [
    (Story) => (
      <RemoteStoryProviders>
        <Story />
      </RemoteStoryProviders>
    ),
    makeRouteDecorator({
      initialPath: `/competitions/${competitionId}/admin/remote`,
      routePath: '/competitions/:competitionId/admin/remote',
    }),
    makeCompetitionContainerDecorator({
      currentUser: remoteAdminUser,
    }),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionRemote>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LiveActivitiesRemote: Story = {};
