import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import {
  CreateRemoteWebhookDocument,
  DeleteRemoteWebhookDocument,
  RemoteWebhooksDocument,
  TestEditingRemoteWebhookDocument,
  TestRemoteWebhookDocument,
  UpdateRemoteWebhookDocument,
} from '@/lib/notifyCompRemoteGraphql';
import { useNotifyCompRemoteWebhooks } from './useNotifyCompRemoteWebhooks';

const competitionId = 'ExampleComp2026';

const webhooksMock = (webhooks: unknown[]): MockedResponse => ({
  request: {
    query: RemoteWebhooksDocument,
    variables: { competitionId },
  },
  result: {
    data: {
      competition: {
        __typename: 'Competition',
        id: competitionId,
        webhooks,
      },
    },
  },
});

const createWrapper = (mocks: MockedResponse[]) =>
  function MockedApolloWrapper({ children }: PropsWithChildren) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  };

describe('useNotifyCompRemoteWebhooks', () => {
  it('loads competition webhooks', async () => {
    const { result } = renderHook(() => useNotifyCompRemoteWebhooks({ competitionId }), {
      wrapper: createWrapper([
        webhooksMock([
          {
            __typename: 'Webhook',
            id: 1,
            method: 'POST',
            url: 'https://example.com/notify',
          },
        ]),
      ]),
    });

    await waitFor(() => {
      expect(result.current.webhooks).toHaveLength(1);
    });

    expect(result.current.webhooks[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.com/notify',
    });
  });

  it('creates, updates, and deletes webhooks with NotifyComp variables', async () => {
    const createVariables = {
      competitionId,
      webhook: {
        method: 'POST' as const,
        url: 'https://example.com/created',
      },
    };
    const updateVariables = {
      id: 4,
      webhook: {
        method: 'GET' as const,
        url: 'https://example.com/updated',
      },
    };

    const { result } = renderHook(() => useNotifyCompRemoteWebhooks({ competitionId }), {
      wrapper: createWrapper([
        webhooksMock([]),
        {
          request: {
            query: CreateRemoteWebhookDocument,
            variables: createVariables,
          },
          result: {
            data: {
              createWebhook: {
                __typename: 'Webhook',
                id: 4,
                ...createVariables.webhook,
              },
            },
          },
        },
        webhooksMock([
          {
            __typename: 'Webhook',
            id: 4,
            ...createVariables.webhook,
          },
        ]),
        {
          request: {
            query: UpdateRemoteWebhookDocument,
            variables: updateVariables,
          },
          result: {
            data: {
              updateWebhook: {
                __typename: 'Webhook',
                id: 4,
                ...updateVariables.webhook,
              },
            },
          },
        },
        webhooksMock([
          {
            __typename: 'Webhook',
            id: 4,
            ...updateVariables.webhook,
          },
        ]),
        {
          request: {
            query: DeleteRemoteWebhookDocument,
            variables: { id: 4 },
          },
          result: {
            data: {
              deleteWebhook: null,
            },
          },
        },
        webhooksMock([]),
      ]),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveWebhook(createVariables.webhook);
    });
    await act(async () => {
      await result.current.saveWebhook(updateVariables.webhook, 4);
    });
    await act(async () => {
      await result.current.removeWebhook(4);
    });

    expect(result.current.error).toBeNull();
  });

  it('tests saved and unsaved webhook settings', async () => {
    const webhook = {
      method: 'PUT' as const,
      url: 'https://example.com/test',
    };
    const { result } = renderHook(() => useNotifyCompRemoteWebhooks({ competitionId }), {
      wrapper: createWrapper([
        webhooksMock([]),
        {
          request: {
            query: TestRemoteWebhookDocument,
            variables: { id: 8 },
          },
          result: {
            data: {
              testWebhook: {
                __typename: 'WebhookResponse',
                body: 'ok',
                status: 200,
                statusText: 'OK',
                url: webhook.url,
              },
            },
          },
        },
        {
          request: {
            query: TestEditingRemoteWebhookDocument,
            variables: { competitionId, webhook },
          },
          result: {
            data: {
              testEditingWebhook: {
                __typename: 'WebhookResponse',
                body: 'failed',
                status: 500,
                statusText: 'Server Error',
                url: webhook.url,
              },
            },
          },
        },
      ]),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.testSavedWebhook(8);
    });

    expect(result.current.testResult).toMatchObject({
      status: 200,
      statusText: 'OK',
    });

    await act(async () => {
      await result.current.testWebhookSettings(webhook);
    });

    expect(result.current.testResult).toMatchObject({
      status: 500,
      statusText: 'Server Error',
    });
  });
});
