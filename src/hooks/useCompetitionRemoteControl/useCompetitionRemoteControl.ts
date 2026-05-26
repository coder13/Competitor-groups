import { useMemo } from 'react';
import { useNotifyCompRemoteActivities } from '@/hooks/useNotifyCompRemoteActivities';
import { isCompetitionDelegateOrOrganizer } from '@/lib/competitionAuthorization';
import {
  getRemoteActiveGroups,
  getRemoteActivityGroups,
  getRemoteActivityStates,
  getRemoteNextGroup,
  getRemotePreviousGroup,
  getRemoteScheduledActivities,
  RemoteActivityGroup,
} from '@/lib/notifyCompRemoteActivities';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

interface UseCompetitionRemoteControlParams {
  competitionId: string;
  enabled?: boolean;
  roomId?: number;
}

const activityIdsForGroup = (group: RemoteActivityGroup) =>
  group.scheduledActivities.map((activity) => activity.id);

const isActiveGroup = (group: RemoteActivityGroup) =>
  group.status === 'current' || group.status === 'mixed';

export function useCompetitionRemoteControl({
  competitionId,
  enabled = true,
  roomId,
}: UseCompetitionRemoteControlParams) {
  const { wcif } = useWCIF();
  const { user } = useAuth();
  const remoteAuth = useNotifyCompRemoteAuth();
  const canManageRemote = isCompetitionDelegateOrOrganizer(wcif, user);
  const isAuthenticated = remoteAuth.isAuthenticatedForCompetition(competitionId);
  const isEnabled = enabled && isAuthenticated && canManageRemote;

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

  const requireRemoteAccess = () => {
    if (!canManageRemote) {
      throw new Error(
        'Only listed competition delegates and organizers can manage remote control.',
      );
    }
  };

  const finishSkippedGroupsBefore = async (group: RemoteActivityGroup) => {
    const targetIndex = activityGroups.findIndex((candidate) => candidate.id === group.id);

    if (targetIndex < 0) {
      return;
    }

    const skippedActivityIds = activityGroups
      .slice(0, targetIndex)
      .filter((candidate) => candidate.status === 'next')
      .flatMap(activityIdsForGroup);

    if (skippedActivityIds.length === 0) {
      return;
    }

    await remote.startActivities(skippedActivityIds);
    await remote.stopActivities(skippedActivityIds);
  };

  const startGroup = async (group: RemoteActivityGroup) => {
    requireRemoteAccess();
    const currentActivityIds = activeGroups.flatMap(activityIdsForGroup);

    if (currentActivityIds.length > 0) {
      await remote.stopActivities(currentActivityIds);
    }

    await finishSkippedGroupsBefore(group);
    return remote.startActivities(activityIdsForGroup(group));
  };
  const stopGroup = (group: RemoteActivityGroup) => {
    requireRemoteAccess();
    return remote.stopActivities(activityIdsForGroup(group));
  };
  const resetGroup = (group: RemoteActivityGroup) => {
    requireRemoteAccess();
    return remote.resetActivities(activityIdsForGroup(group));
  };
  const startActivity = (activityId: number) => {
    requireRemoteAccess();
    return remote.startActivity(activityId);
  };
  const stopActivity = (activityId: number) => {
    requireRemoteAccess();
    return remote.stopActivity(activityId);
  };
  const resetActivity = (activityId: number) => {
    requireRemoteAccess();
    return remote.resetActivity(activityId);
  };
  const startActivities = (activityIds: number[]) => {
    requireRemoteAccess();
    return remote.startActivities(activityIds);
  };
  const stopActivities = (activityIds: number[]) => {
    requireRemoteAccess();
    return remote.stopActivities(activityIds);
  };
  const resetActivities = (activityIds: number[]) => {
    requireRemoteAccess();
    return remote.resetActivities(activityIds);
  };
  const importCompetition = () => {
    requireRemoteAccess();
    return remote.importCompetition();
  };
  const resetAllActivities = () => {
    requireRemoteAccess();
    return remote.resetAllActivities();
  };
  const finishAllActivities = () => {
    requireRemoteAccess();
    const unfinishedActivityIds = remote.activities
      .filter((activity) => activity.startTime && !activity.endTime)
      .map((activity) => activity.activityId);

    if (unfinishedActivityIds.length === 0) {
      return Promise.resolve();
    }

    return remote.stopActivities(unfinishedActivityIds);
  };
  const updateAutoAdvance = (autoAdvance: boolean) => {
    requireRemoteAccess();
    return remote.updateAutoAdvance(autoAdvance);
  };

  const switchToGroup = async (group?: RemoteActivityGroup) => {
    requireRemoteAccess();

    if (!group) {
      return;
    }

    const currentActivityIds = activeGroups.flatMap(activityIdsForGroup);

    if (currentActivityIds.length > 0) {
      await remote.stopActivities(currentActivityIds);
    }

    if (!isActiveGroup(group)) {
      await finishSkippedGroupsBefore(group);
    }

    await remote.startActivities(activityIdsForGroup(group));
  };

  const switchToPreviousGroup = async () => {
    requireRemoteAccess();

    if (!previousGroup) {
      return;
    }

    const currentActivityIds = activeGroups.flatMap(activityIdsForGroup);

    if (currentActivityIds.length > 0) {
      await remote.stopActivities(currentActivityIds);
      await remote.resetActivities(currentActivityIds);
    }

    await remote.startActivities(activityIdsForGroup(previousGroup));
  };

  return {
    ...remote,
    activeGroups,
    activityGroups,
    activityStates,
    canManageRemote,
    finishAllActivities,
    importCompetition,
    isAuthenticated,
    isEnabled,
    nextGroup,
    previousGroup,
    resetActivities,
    resetActivity,
    resetAllActivities,
    resetGroup,
    scheduledActivities,
    startActivities,
    startActivity,
    startGroup,
    stopActivities,
    stopActivity,
    stopGroup,
    switchToPreviousGroup,
    switchToGroup,
    updateAutoAdvance,
  };
}
