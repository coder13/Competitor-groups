import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNotifyCompRemoteWebhooks } from '@/hooks/useNotifyCompRemoteWebhooks';
import { ConfirmProvider } from '@/providers/ConfirmProvider';
import { RemoteWebhookSetup } from './RemoteWebhookSetup';

jest.mock('@/hooks/useNotifyCompRemoteWebhooks', () => ({
  useNotifyCompRemoteWebhooks: jest.fn(),
}));

const competitionId = 'ExampleComp2026';

const defaultHookValue = {
  error: null,
  isLoading: false,
  isSaving: false,
  isTesting: false,
  removeWebhook: jest.fn().mockResolvedValue(undefined),
  saveWebhook: jest.fn().mockResolvedValue(undefined),
  testResult: null,
  testSavedWebhook: jest.fn().mockResolvedValue(undefined),
  testWebhookSettings: jest.fn().mockResolvedValue(undefined),
  webhooks: [],
};

const renderSetup = (hookValue = {}) => {
  const value = {
    ...defaultHookValue,
    ...hookValue,
  };
  jest
    .mocked(useNotifyCompRemoteWebhooks)
    .mockReturnValue(value as unknown as ReturnType<typeof useNotifyCompRemoteWebhooks>);

  render(
    <ConfirmProvider>
      <RemoteWebhookSetup competitionId={competitionId} />
    </ConfirmProvider>,
  );

  return value;
};

describe('RemoteWebhookSetup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists saved webhooks with method and URL', () => {
    renderSetup({
      webhooks: [
        {
          id: 1,
          method: 'POST',
          url: 'https://example.com/notify',
        },
      ],
    });

    expect(screen.getByRole('heading', { name: 'Webhook setup' })).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/notify')).toBeInTheDocument();
  });

  it('creates a webhook from the form', async () => {
    const user = userEvent.setup();
    const hook = renderSetup();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add webhook' }));
    });
    await act(async () => {
      await user.selectOptions(screen.getByLabelText('HTTP method'), 'GET');
      await user.type(screen.getByLabelText('URL'), 'https://example.com/new');
      await user.click(screen.getByRole('button', { name: 'Create webhook' }));
    });

    await waitFor(() => {
      expect(hook.saveWebhook).toHaveBeenCalledWith(
        {
          method: 'GET',
          url: 'https://example.com/new',
        },
        undefined,
      );
    });
  });

  it('updates an existing webhook from the edit form', async () => {
    const user = userEvent.setup();
    const hook = renderSetup({
      webhooks: [
        {
          id: 2,
          method: 'POST',
          url: 'https://example.com/old',
        },
      ],
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });
    await act(async () => {
      await user.clear(screen.getByLabelText('URL'));
      await user.type(screen.getByLabelText('URL'), 'https://example.com/updated');
      await user.click(screen.getByRole('button', { name: 'Save webhook' }));
    });

    await waitFor(() => {
      expect(hook.saveWebhook).toHaveBeenCalledWith(
        {
          method: 'POST',
          url: 'https://example.com/updated',
        },
        2,
      );
    });
  });

  it('deletes a webhook after confirmation', async () => {
    const user = userEvent.setup();
    const hook = renderSetup({
      webhooks: [
        {
          id: 3,
          method: 'DELETE',
          url: 'https://example.com/remove',
        },
      ],
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Delete' }));
    });
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Delete webhook' }));
    });

    await waitFor(() => {
      expect(hook.removeWebhook).toHaveBeenCalledWith(3);
    });
  });

  it('tests saved and unsaved webhook settings', async () => {
    const user = userEvent.setup();
    const hook = renderSetup({
      testResult: {
        body: 'Request accepted',
        status: 202,
        statusText: 'Accepted',
        url: 'https://example.com/test',
      },
      webhooks: [
        {
          id: 4,
          method: 'POST',
          url: 'https://example.com/test',
        },
      ],
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Test' }));
    });

    expect(hook.testSavedWebhook).toHaveBeenCalledWith(4);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add webhook' }));
    });
    await act(async () => {
      await user.type(screen.getByLabelText('URL'), 'https://example.com/draft');
      await user.click(screen.getAllByRole('button', { name: 'Test' })[0]);
    });

    expect(hook.testWebhookSettings).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://example.com/draft',
    });
    expect(screen.getByText('202 Accepted')).toBeInTheDocument();
    expect(screen.getByText('Request accepted')).toBeInTheDocument();
  });

  it('renders failed test results', () => {
    renderSetup({
      testResult: {
        body: '',
        status: 0,
        statusText: '',
        url: 'https://example.com/fail',
      },
    });

    expect(screen.getByText('0 Request failed')).toBeInTheDocument();
    expect(screen.getByText('Empty response body')).toBeInTheDocument();
  });
});
