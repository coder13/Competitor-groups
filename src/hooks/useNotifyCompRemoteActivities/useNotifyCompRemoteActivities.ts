import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import {
  ImportRemoteCompetitionDocument,
  NotifyCompActivity,
  NotifyCompCompetition,
  RemoteActivitiesDocument,
  RemoteActivitiesSubscriptionDocument,
  RemoteCompetitionDocument,
  ResetRemoteActivitiesDocument,
  ResetRemoteActivityDocument,
  StartRemoteActivitiesDocument,
  StartRemoteActivityDocument,
  StopRemoteActivitiesDocument,
  StopRemoteActivityDocument,
  UpdateRemoteAutoAdvanceDocument,
} from '@/lib/notifyCompRemoteGraphql';

interface UseNotifyCompRemoteActivitiesParams {
  competitionId: string;
  enabled?: boolean;
  roomId?: number;
}

export function useNotifyCompRemoteActivities({
  competitionId,
  enabled = true,
  roomId,
}: UseNotifyCompRemoteActivitiesParams) {
  const [mutationError, setMutationError] = useState<string | null>(null);

  const activitiesQuery = useQuery<{ activities: NotifyCompActivity[] }>(RemoteActivitiesDocument, {
    variables: { competitionId, roomId },
    skip: !competitionId || !enabled,
  });

  const competitionQuery = useQuery<{ competition: NotifyCompCompetition | null }>(
    RemoteCompetitionDocument,
    {
      variables: { competitionId },
      skip: !competitionId || !enabled,
    },
  );
  const { subscribeToMore } = activitiesQuery;

  useEffect(() => {
    if (!competitionId || !enabled || !subscribeToMore) {
      return;
    }

    const unsubscribe = subscribeToMore<{ activity: NotifyCompActivity }>({
      document: RemoteActivitiesSubscriptionDocument,
      variables: { competitionIds: [competitionId] },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.activity) {
          return prev;
        }

        const activity = subscriptionData.data.activity;

        return {
          ...prev,
          activities: [
            ...(prev.activities || []).filter(
              (candidate) => candidate.activityId !== activity.activityId,
            ),
            activity,
          ],
        };
      },
    });

    return () => unsubscribe();
  }, [competitionId, enabled, subscribeToMore]);

  const refetchQueries = useMemo(
    () => [
      {
        query: RemoteActivitiesDocument,
        variables: { competitionId, roomId },
      },
      {
        query: RemoteCompetitionDocument,
        variables: { competitionId },
      },
    ],
    [competitionId, roomId],
  );

  const mutationOptions = {
    refetchQueries,
    onError: (error: Error) => {
      setMutationError(error.message);
    },
  };

  const [startActivity, startActivityStatus] = useMutation(
    StartRemoteActivityDocument,
    mutationOptions,
  );
  const [stopActivity, stopActivityStatus] = useMutation(
    StopRemoteActivityDocument,
    mutationOptions,
  );
  const [resetActivity, resetActivityStatus] = useMutation(
    ResetRemoteActivityDocument,
    mutationOptions,
  );
  const [startActivities, startActivitiesStatus] = useMutation(
    StartRemoteActivitiesDocument,
    mutationOptions,
  );
  const [stopActivities, stopActivitiesStatus] = useMutation(
    StopRemoteActivitiesDocument,
    mutationOptions,
  );
  const [resetActivities, resetActivitiesStatus] = useMutation(
    ResetRemoteActivitiesDocument,
    mutationOptions,
  );
  const [updateAutoAdvance, updateAutoAdvanceStatus] = useMutation(
    UpdateRemoteAutoAdvanceDocument,
    mutationOptions,
  );
  const [importCompetition, importCompetitionStatus] = useMutation(
    ImportRemoteCompetitionDocument,
    mutationOptions,
  );

  const runMutation = async (operation: () => Promise<unknown>) => {
    setMutationError(null);
    await operation();
  };

  return {
    activities: activitiesQuery.data?.activities || [],
    autoAdvance: competitionQuery.data?.competition?.autoAdvance,
    competition: competitionQuery.data?.competition || null,
    error:
      mutationError || activitiesQuery.error?.message || competitionQuery.error?.message || null,
    isLoading: activitiesQuery.loading || competitionQuery.loading,
    isSaving:
      importCompetitionStatus.loading ||
      startActivityStatus.loading ||
      stopActivityStatus.loading ||
      resetActivityStatus.loading ||
      startActivitiesStatus.loading ||
      stopActivitiesStatus.loading ||
      resetActivitiesStatus.loading ||
      updateAutoAdvanceStatus.loading,
    importCompetition: () =>
      runMutation(() =>
        importCompetition({
          variables: { competitionId },
        }),
      ),
    resetActivities: (activityIds: number[]) =>
      runMutation(() =>
        resetActivities({
          variables: { competitionId, activityIds },
        }),
      ),
    resetActivity: (activityId: number) =>
      runMutation(() =>
        resetActivity({
          variables: { competitionId, activityId },
        }),
      ),
    startActivities: (activityIds: number[]) =>
      runMutation(() =>
        startActivities({
          variables: { competitionId, activityIds },
        }),
      ),
    startActivity: (activityId: number) =>
      runMutation(() =>
        startActivity({
          variables: { competitionId, activityId },
        }),
      ),
    stopActivities: (activityIds: number[]) =>
      runMutation(() =>
        stopActivities({
          variables: { competitionId, activityIds },
        }),
      ),
    stopActivity: (activityId: number) =>
      runMutation(() =>
        stopActivity({
          variables: { competitionId, activityId },
        }),
      ),
    updateAutoAdvance: (autoAdvance: boolean) =>
      runMutation(() =>
        updateAutoAdvance({
          variables: { competitionId, autoAdvance },
        }),
      ),
  };
}
