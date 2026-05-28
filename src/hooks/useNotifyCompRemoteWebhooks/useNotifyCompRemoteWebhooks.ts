import { useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import {
  CreateRemoteWebhookDocument,
  DeleteRemoteWebhookDocument,
  NotifyCompWebhook,
  NotifyCompWebhookInput,
  NotifyCompWebhookResponse,
  RemoteWebhooksDocument,
  TestEditingRemoteWebhookDocument,
  TestRemoteWebhookDocument,
  UpdateRemoteWebhookDocument,
} from '@/lib/notifyCompRemoteGraphql';

interface UseNotifyCompRemoteWebhooksParams {
  competitionId: string;
  enabled?: boolean;
}

interface RemoteWebhooksQueryData {
  competition: {
    id: string;
    webhooks: NotifyCompWebhook[];
  } | null;
}

export function useNotifyCompRemoteWebhooks({
  competitionId,
  enabled = true,
}: UseNotifyCompRemoteWebhooksParams) {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<NotifyCompWebhookResponse | null>(null);

  const webhooksQuery = useQuery<RemoteWebhooksQueryData>(RemoteWebhooksDocument, {
    variables: { competitionId },
    skip: !competitionId || !enabled,
  });

  const refetchQueries = useMemo(
    () => [
      {
        query: RemoteWebhooksDocument,
        variables: { competitionId },
      },
    ],
    [competitionId],
  );

  const mutationOptions = {
    refetchQueries,
  };

  const [createWebhook, createWebhookStatus] = useMutation<
    { createWebhook: NotifyCompWebhook },
    { competitionId: string; webhook: NotifyCompWebhookInput }
  >(CreateRemoteWebhookDocument, mutationOptions);
  const [updateWebhook, updateWebhookStatus] = useMutation<
    { updateWebhook: NotifyCompWebhook },
    { id: number; webhook: NotifyCompWebhookInput }
  >(UpdateRemoteWebhookDocument, mutationOptions);
  const [deleteWebhook, deleteWebhookStatus] = useMutation<
    { deleteWebhook?: null },
    { id: number }
  >(DeleteRemoteWebhookDocument, mutationOptions);
  const [testWebhook, testWebhookStatus] = useMutation<
    { testWebhook: NotifyCompWebhookResponse | null },
    { id: number }
  >(TestRemoteWebhookDocument);
  const [testEditingWebhook, testEditingWebhookStatus] = useMutation<
    { testEditingWebhook: NotifyCompWebhookResponse | null },
    { competitionId: string; webhook: NotifyCompWebhookInput }
  >(TestEditingRemoteWebhookDocument);

  const runMutation = async (operation: () => Promise<unknown>) => {
    setMutationError(null);
    setTestResult(null);

    try {
      await operation();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Webhook operation failed.');
      throw err;
    }
  };

  const saveWebhook = (webhook: NotifyCompWebhookInput, id?: number) =>
    runMutation(() =>
      id
        ? updateWebhook({
            variables: { id, webhook },
          })
        : createWebhook({
            variables: { competitionId, webhook },
          }),
    );

  const removeWebhook = (id: number) =>
    runMutation(() =>
      deleteWebhook({
        variables: { id },
      }),
    );

  const testSavedWebhook = (id: number) =>
    runMutation(async () => {
      const result = await testWebhook({
        variables: { id },
      });
      setTestResult(result.data?.testWebhook || null);
    });

  const testWebhookSettings = (webhook: NotifyCompWebhookInput) =>
    runMutation(async () => {
      const result = await testEditingWebhook({
        variables: { competitionId, webhook },
      });
      setTestResult(result.data?.testEditingWebhook || null);
    });

  return {
    error: mutationError || webhooksQuery.error?.message || null,
    isLoading: webhooksQuery.loading,
    isSaving:
      createWebhookStatus.loading || updateWebhookStatus.loading || deleteWebhookStatus.loading,
    isTesting: testWebhookStatus.loading || testEditingWebhookStatus.loading,
    removeWebhook,
    saveWebhook,
    testResult,
    testSavedWebhook,
    testWebhookSettings,
    webhooks: webhooksQuery.data?.competition?.webhooks || [],
  };
}
