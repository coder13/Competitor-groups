import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import type { Meta, StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { RemoteCompetitionDocument, RemoteWebhooksDocument } from '@/lib/notifyCompRemoteGraphql';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import {
  NotifyCompRemoteAuthContext,
  NotifyCompRemoteAuthContextValue,
} from '@/providers/NotifyCompRemoteAuthProvider/NotifyCompRemoteAuthContext';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import CompetitionRemoteWebhooks from './Webhooks';

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

const webhookMocks: MockedResponse[] = [
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
      query: RemoteWebhooksDocument,
      variables: {
        competitionId,
      },
    },
    result: {
      data: {
        competition: {
          id: competitionId,
          webhooks: [
            {
              id: 1,
              method: 'POST',
              url: 'https://hooks.example.com/live-activities',
            },
            {
              id: 2,
              method: 'GET',
              url: 'https://status.example.com/ping',
            },
          ],
        },
      },
    },
  },
];

function WebhookPageStoryProviders({ children }: { children: ReactNode }) {
  return (
    <MockedProvider addTypename={false} mocks={webhookMocks}>
      <ConfirmProvider>
        <NotifyCompRemoteAuthContext.Provider value={remoteAuthContext}>
          {children}
        </NotifyCompRemoteAuthContext.Provider>
      </ConfirmProvider>
    </MockedProvider>
  );
}

const meta = {
  title: 'Pages/Competition/Remote/Webhooks',
  component: CompetitionRemoteWebhooks,
  decorators: [
    (Story) => (
      <WebhookPageStoryProviders>
        <Story />
      </WebhookPageStoryProviders>
    ),
    makeRouteDecorator({
      initialPath: `/competitions/${competitionId}/admin/webhooks`,
      routePath: '/competitions/:competitionId/admin/webhooks',
    }),
    makeCompetitionContainerDecorator({
      currentUser: remoteAdminUser,
    }),
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionRemoteWebhooks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WebhookEditor: Story = {};
