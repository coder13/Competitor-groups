import { useMemo } from 'react';
import { useNotifyCompRemoteActivities } from '@/hooks/useNotifyCompRemoteActivities';
import {
  getRemoteActiveGroups,
  getRemoteActivityGroups,
  getRemoteActivityStates,
  getRemoteNextGroup,
  getRemotePreviousGroup,
  getRemoteScheduledActivities,
  RemoteActivityGroup,
} from '@/lib/notifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

interface UseCompetitionRemoteControlParams {
  competitionId: string;
  enabled?: boolean;
  roomId?: number;
}

const activityIdsForGroup = (group: RemoteActivityGroup) =>
  group.scheduledActivities.map((activity) => activity.id);

export function useCompetitionRemoteControl({
  competitionId,
  enabled = true,
  roomId,
}: UseCompetitionRemoteControlParams) {
  const { wcif } = useWCIF();
  const remoteAuth = useNotifyCompRemoteAuth();
  const isAuthenticated = remoteAuth.isAuthenticatedForCompetition(competitionId);
  const isEnabled = enabled && isAuthenticated;

  const remote = useNotifyCompRemoteActivities({
    competitionId,
    enabled: isEnabled,
    roomId,
  });

  const scheduledActivities = useMemo(
    () => (wcif ? getRemoteScheduledActivities(wcif, roomId) : []),
    [roomId, wcif],
  );

  const activityStates = useMemo(
    () => getRemoteActivityStates(scheduledActivities, remote.activities),
    [remote.activities, scheduledActivities],
  );

  const activityGroups = useMemo(
    () => getRemoteActivityGroups(scheduledActivities, remote.activities),
    [remote.activities, scheduledActivities],
  );

  const activeGroups = useMemo(() => getRemoteActiveGroups(activityGroups), [activityGroups]);
  const previousGroup = useMemo(() => getRemotePreviousGroup(activityGroups), [activityGroups]);
  const nextGroup = useMemo(() => getRemoteNextGroup(activityGroups), [activityGroups]);

  const startGroup = (group: RemoteActivityGroup) =>
    remote.startActivities(activityIdsForGroup(group));
  const stopGroup = (group: RemoteActivityGroup) =>
    remote.stopActivities(activityIdsForGroup(group));
  const resetGroup = (group: RemoteActivityGroup) =>
    remote.resetActivities(activityIdsForGroup(group));

  const switchToGroup = async (group?: RemoteActivityGroup) => {
    if (!group) {
      return;
    }

    const currentActivityIds = activeGroups.flatMap(activityIdsForGroup);

    if (currentActivityIds.length > 0) {
      await remote.stopActivities(currentActivityIds);
    }

    await remote.startActivities(activityIdsForGroup(group));
  };

  return {
    ...remote,
    activeGroups,
    activityGroups,
    activityStates,
    isAuthenticated,
    nextGroup,
    previousGroup,
    resetGroup,
    scheduledActivities,
    startGroup,
    stopGroup,
    switchToGroup,
  };
}
