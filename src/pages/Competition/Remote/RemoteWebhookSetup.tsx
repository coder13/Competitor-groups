import { FormEvent, useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/Button';
import { NoteBox } from '@/components/Notebox';
import { useNotifyCompRemoteWebhooks } from '@/hooks/useNotifyCompRemoteWebhooks';
import {
  HttpMethod,
  NotifyCompWebhook,
  NotifyCompWebhookInput,
  NotifyCompWebhookResponse,
} from '@/lib/notifyCompRemoteGraphql';
import { useConfirm } from '@/providers/ConfirmProvider';

const HTTP_METHODS: HttpMethod[] = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
const BODY_SUMMARY_LENGTH = 300;

interface WebhookFormState {
  id?: number;
  method: HttpMethod;
  url: string;
}

export interface RemoteWebhookSetupController {
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  removeWebhook: (id: number) => Promise<void>;
  saveWebhook: (webhook: NotifyCompWebhookInput, id?: number) => Promise<void>;
  testResult: NotifyCompWebhookResponse | null;
  testSavedWebhook: (id: number) => Promise<void>;
  testWebhookSettings: (webhook: NotifyCompWebhookInput) => Promise<void>;
  webhooks: NotifyCompWebhook[];
}

interface RemoteWebhookSetupPanelProps {
  disabled?: boolean;
  webhooks: RemoteWebhookSetupController;
}

interface RemoteWebhookSetupProps {
  competitionId: string;
  disabled?: boolean;
}

const emptyForm: WebhookFormState = {
  method: 'POST',
  url: '',
};

const webhookToForm = (webhook: NotifyCompWebhook): WebhookFormState => ({
  id: webhook.id,
  method: webhook.method,
  url: webhook.url,
});

const toWebhookInput = (form: WebhookFormState): NotifyCompWebhookInput => ({
  method: form.method,
  url: form.url.trim(),
});

const bodySummary = (body?: string | null) => {
  const trimmedBody = body?.trim();

  if (!trimmedBody) {
    return 'Empty response body';
  }

  return trimmedBody.length > BODY_SUMMARY_LENGTH
    ? `${trimmedBody.slice(0, BODY_SUMMARY_LENGTH)}...`
    : trimmedBody;
};

function WebhookTestResult({ result }: { result: NotifyCompWebhookResponse }) {
  const statusText = result.statusText || (result.status === 0 ? 'Request failed' : 'No text');

  return (
    <div className="space-y-2 rounded-md border border-tertiary-weak bg-tertiary p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="type-label">Test result</span>
        <span className="rounded bg-panel px-2 py-1 type-meta text-default">
          {result.status} {statusText}
        </span>
      </div>
      <p className="break-all type-meta text-subtle">{result.url}</p>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-panel p-2 type-meta text-default">
        {bodySummary(result.body)}
      </pre>
    </div>
  );
}

interface WebhookFormProps {
  disabled: boolean;
  form: WebhookFormState;
  isSaving: boolean;
  isTesting: boolean;
  onCancel: () => void;
  onChange: (form: WebhookFormState) => void;
  onSave: (form: WebhookFormState) => void;
  onTest: (form: WebhookFormState) => void;
}

function WebhookForm({
  disabled,
  form,
  isSaving,
  isTesting,
  onCancel,
  onChange,
  onSave,
  onTest,
}: WebhookFormProps) {
  const isBusy = disabled || isSaving || isTesting;
  const canSubmit = Boolean(form.url.trim()) && !isBusy;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canSubmit) {
      onSave(form);
    }
  };

  return (
    <form className="space-y-4 rounded-md border border-tertiary-weak p-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
        <label className="form-group">
          <span className="form-label">HTTP method</span>
          <select
            className="select input-lg"
            disabled={isBusy}
            value={form.method}
            onChange={(event) => {
              onChange({ ...form, method: event.target.value as HttpMethod });
            }}>
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span className="form-label">URL</span>
          <input
            className="input input-lg"
            disabled={isBusy}
            placeholder="https://example.com/notify"
            type="url"
            value={form.url}
            onChange={(event) => {
              onChange({ ...form, url: event.target.value });
            }}
          />
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="light" disabled={isBusy} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="gray"
          disabled={!canSubmit}
          onClick={() => {
            onTest(form);
          }}>
          {isTesting ? 'Testing...' : 'Test'}
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSaving ? 'Saving...' : form.id ? 'Save webhook' : 'Create webhook'}
        </Button>
      </div>
    </form>
  );
}

export function RemoteWebhookSetupPanel({
  disabled = false,
  webhooks,
}: RemoteWebhookSetupPanelProps) {
  const confirm = useConfirm();
  const [form, setForm] = useState<WebhookFormState | null>(null);

  useEffect(() => {
    if (form?.id) {
      const latestWebhook = webhooks.webhooks.find((webhook) => webhook.id === form.id);

      if (latestWebhook) {
        setForm(webhookToForm(latestWebhook));
      }
    }
  }, [form?.id, webhooks.webhooks]);

  const controlsDisabled = disabled || webhooks.isSaving || webhooks.isTesting;

  const saveWebhook = async (nextForm: WebhookFormState) => {
    try {
      await webhooks.saveWebhook(toWebhookInput(nextForm), nextForm.id);
      setForm(null);
    } catch {
      // The hook exposes the mutation error inline.
    }
  };

  const removeWebhook = async (webhook: NotifyCompWebhook) => {
    const confirmed = await confirm({
      confirmLabel: 'Delete webhook',
      confirmVariant: 'gray',
      message: `Delete the ${webhook.method} webhook for ${webhook.url}?`,
    });

    if (confirmed) {
      try {
        await webhooks.removeWebhook(webhook.id);
      } catch {
        // The hook exposes the mutation error inline.
      }
    }
  };

  const testWebhookSettings = async (nextForm: WebhookFormState) => {
    try {
      await webhooks.testWebhookSettings(toWebhookInput(nextForm));
    } catch {
      // The hook exposes the mutation error inline.
    }
  };

  const testSavedWebhook = async (webhook: NotifyCompWebhook) => {
    try {
      await webhooks.testSavedWebhook(webhook.id);
    } catch {
      // The hook exposes the mutation error inline.
    }
  };

  return (
    <section className="border-t border-tertiary-weak pt-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <h2 className="type-heading">Webhook setup</h2>
            <p className="type-body-sm text-subtle">
              Notify external services when Live Activities are started or stopped.
            </p>
          </div>
          <Button
            type="button"
            disabled={controlsDisabled || Boolean(form)}
            onClick={() => {
              setForm(emptyForm);
            }}>
            Add webhook
          </Button>
        </div>

        {webhooks.isLoading && <BarLoader width="100%" />}
        {webhooks.error && <NoteBox prefix="Webhook error" text={webhooks.error} />}

        {form && (
          <WebhookForm
            disabled={disabled}
            form={form}
            isSaving={webhooks.isSaving}
            isTesting={webhooks.isTesting}
            onCancel={() => {
              setForm(null);
            }}
            onChange={setForm}
            onSave={(nextForm) => {
              void saveWebhook(nextForm);
            }}
            onTest={(nextForm) => {
              void testWebhookSettings(nextForm);
            }}
          />
        )}

        {webhooks.testResult && <WebhookTestResult result={webhooks.testResult} />}

        {!webhooks.isLoading && webhooks.webhooks.length === 0 ? (
          <NoteBox
            prefix="No webhooks"
            text="Create a webhook to send activity updates to another service."
          />
        ) : (
          <div className="space-y-2">
            {webhooks.webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex flex-col gap-4 rounded-md border border-tertiary-weak p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-tertiary px-2 py-1 type-meta text-default">
                      {webhook.method}
                    </span>
                    <span className="break-all type-body-sm">{webhook.url}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button
                    type="button"
                    variant="gray"
                    disabled={controlsDisabled}
                    onClick={() => {
                      void testSavedWebhook(webhook);
                    }}>
                    Test
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    disabled={controlsDisabled || Boolean(form)}
                    onClick={() => {
                      setForm(webhookToForm(webhook));
                    }}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="gray"
                    disabled={controlsDisabled}
                    onClick={() => {
                      void removeWebhook(webhook);
                    }}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function RemoteWebhookSetup({ competitionId, disabled = false }: RemoteWebhookSetupProps) {
  const webhooks = useNotifyCompRemoteWebhooks({ competitionId });

  return <RemoteWebhookSetupPanel disabled={disabled} webhooks={webhooks} />;
}
