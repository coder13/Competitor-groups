import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import { RemoteWebhookSetupController, RemoteWebhookSetupPanel } from './RemoteWebhookSetup';

type StoryWebhook = RemoteWebhookSetupController['webhooks'][number];
type StoryTestResult = RemoteWebhookSetupController['testResult'];

interface WebhookSetupStoryArgs {
  disabled: boolean;
  error: string | null;
  initialTestResult: StoryTestResult;
  initialWebhooks: StoryWebhook[];
  isLoading: boolean;
}

const savedWebhooks: StoryWebhook[] = [
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
];

function WebhookSetupStory({
  disabled,
  error,
  initialTestResult,
  initialWebhooks,
  isLoading,
}: WebhookSetupStoryArgs) {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [testResult, setTestResult] = useState(initialTestResult);

  const controller: RemoteWebhookSetupController = {
    error,
    isLoading,
    isSaving: false,
    isTesting: false,
    removeWebhook: async (id) => {
      setWebhooks((currentWebhooks) => currentWebhooks.filter((webhook) => webhook.id !== id));
    },
    saveWebhook: async (webhook, id) => {
      setWebhooks((currentWebhooks) => {
        if (id) {
          return currentWebhooks.map((currentWebhook) =>
            currentWebhook.id === id ? { id, ...webhook } : currentWebhook,
          );
        }

        return [
          ...currentWebhooks,
          {
            id: Math.max(0, ...currentWebhooks.map((currentWebhook) => currentWebhook.id)) + 1,
            ...webhook,
          },
        ];
      });
    },
    testResult,
    testSavedWebhook: async (id) => {
      const webhook = webhooks.find((currentWebhook) => currentWebhook.id === id);

      setTestResult({
        body: '{"ok":true,"message":"Ping accepted"}',
        status: 202,
        statusText: 'Accepted',
        url: webhook?.url || 'https://hooks.example.com/live-activities',
      });
    },
    testWebhookSettings: async (webhook) => {
      setTestResult({
        body: 'Draft webhook settings responded successfully.',
        status: 200,
        statusText: 'OK',
        url: webhook.url,
      });
    },
    webhooks,
  };

  return <RemoteWebhookSetupPanel disabled={disabled} webhooks={controller} />;
}

const meta = {
  title: 'Pages/Competition/Remote/Webhook Setup',
  component: WebhookSetupStory,
  render: (args) => <WebhookSetupStory {...args} />,
  decorators: [
    (Story) => (
      <ConfirmProvider>
        <div className="w-full max-w-3xl bg-panel p-4 text-default">
          <Story />
        </div>
      </ConfirmProvider>
    ),
  ],
  args: {
    disabled: false,
    error: null,
    initialTestResult: null,
    initialWebhooks: savedWebhooks,
    isLoading: false,
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WebhookSetupStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SavedWebhooks: Story = {};

export const Empty: Story = {
  args: {
    initialWebhooks: [],
  },
};

export const TestResult: Story = {
  args: {
    initialTestResult: {
      body: '{"ok":true,"received":1}',
      status: 200,
      statusText: 'OK',
      url: 'https://hooks.example.com/live-activities',
    },
  },
};

export const Loading: Story = {
  args: {
    initialWebhooks: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'Webhook URL must use HTTPS',
    initialWebhooks: [],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
