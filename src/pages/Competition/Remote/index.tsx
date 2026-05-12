import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button, Container, NoteBox } from '@/components';
import { useNotifyCompRemoteActivities } from '@/hooks/useNotifyCompRemoteActivities';
import { getRooms } from '@/lib/activities';
import {
  getRemoteActivityGroups,
  getRemoteActivityStates,
  getRemoteScheduledActivities,
  RemoteActivityGroup,
  RemoteActivityState,
} from '@/lib/notifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteActivityList, RemoteGroupList } from './RemoteActivityList';

const activityIdsForGroup = (group: RemoteActivityGroup) =>
  group.scheduledActivities.map((activity) => activity.id);

const confirmAction = (message: string) => window.confirm(message);

export default function CompetitionRemote() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { wcif, setTitle } = useWCIF();
  const remoteAuth = useNotifyCompRemoteAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | 'all'>('all');

  useEffect(() => {
    setTitle('Remote');
  }, [setTitle]);

  const rooms = useMemo(() => (wcif ? getRooms(wcif) : []), [wcif]);
  const roomId = selectedRoomId === 'all' ? undefined : selectedRoomId;
  const isRemoteAuthenticated = competitionId
    ? remoteAuth.isAuthenticatedForCompetition(competitionId)
    : false;
  const remote = useNotifyCompRemoteActivities({
    competitionId: competitionId || '',
    enabled: isRemoteAuthenticated,
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

  if (!competitionId || !wcif) {
    return null;
  }

  const startActivity = (state: RemoteActivityState) => {
    if (!confirmAction(`Start ${state.scheduledActivity.name}?`)) {
      return;
    }

    void remote.startActivity(state.scheduledActivity.id);
  };

  const stopActivity = (state: RemoteActivityState) => {
    if (!confirmAction(`Stop ${state.scheduledActivity.name}?`)) {
      return;
    }

    void remote.stopActivity(state.scheduledActivity.id);
  };

  const resetActivity = (state: RemoteActivityState) => {
    if (
      !confirmAction(`Reset ${state.scheduledActivity.name}? This clears its start and stop times.`)
    ) {
      return;
    }

    void remote.resetActivity(state.scheduledActivity.id);
  };

  const startGroup = (group: RemoteActivityGroup) => {
    if (!confirmAction(`Start ${group.name} in all listed rooms?`)) {
      return;
    }

    void remote.startActivities(activityIdsForGroup(group));
  };

  const stopGroup = (group: RemoteActivityGroup) => {
    if (!confirmAction(`Stop ${group.name} in all listed rooms?`)) {
      return;
    }

    void remote.stopActivities(activityIdsForGroup(group));
  };

  const resetGroup = (group: RemoteActivityGroup) => {
    if (!confirmAction(`Reset ${group.name} in all listed rooms?`)) {
      return;
    }

    void remote.resetActivities(activityIdsForGroup(group));
  };

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="type-display">Remote</h1>
          <p className="type-body-sm text-subtle">
            Control live activity status for {wcif.shortName || wcif.name}.
          </p>
        </div>

        {remoteAuth.error && <NoteBox prefix="Remote sign in" text={remoteAuth.error} />}

        {!isRemoteAuthenticated ? (
          <div className="space-y-4 rounded border border-tertiary-weak bg-panel p-4 shadow-md shadow-tertiary-dark">
            <div className="space-y-2">
              <h2 className="type-heading">Remote authorization</h2>
              <p className="type-body-sm text-subtle">
                Authorize this competition with your WCA account to start, stop, reset, or
                auto-advance activities.
              </p>
            </div>
            <Button
              type="button"
              disabled={remoteAuth.authenticating}
              onClick={() => {
                void remoteAuth.signIn(competitionId);
              }}>
              {remoteAuth.authenticating ? 'Authorizing...' : 'Authorize remote control'}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded border border-tertiary-weak bg-panel p-4 shadow-md shadow-tertiary-dark md:flex-row md:items-center">
              <div className="flex-1 space-y-1">
                <h2 className="type-heading">Remote session</h2>
                <p className="type-meta">
                  {remoteAuth.userName ? `Signed in as ${remoteAuth.userName}` : 'Signed in'}
                </p>
              </div>
              <Button type="button" variant="gray" onClick={remoteAuth.signOut}>
                Sign out
              </Button>
            </div>

            {remote.isLoading && <BarLoader width="100%" />}
            {remote.error && <NoteBox prefix="Remote error" text={remote.error} />}

            <div className="space-y-4 rounded border border-tertiary-weak bg-panel p-4 shadow-md shadow-tertiary-dark">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1 space-y-1">
                  <h2 className="type-heading">Controls</h2>
                  <p className="type-meta">
                    {selectedRoomId === 'all' ? 'All rooms' : 'Single room'} selected.
                  </p>
                </div>
                <label className="flex flex-col gap-1 type-label">
                  Room
                  <select
                    className="select"
                    value={selectedRoomId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedRoomId(value === 'all' ? 'all' : Number(value));
                    }}>
                    <option value="all">All rooms</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={remote.autoAdvance ? 'green' : 'light'}
                  disabled={remote.isSaving}
                  onClick={() => {
                    if (
                      confirmAction(
                        `${remote.autoAdvance ? 'Disable' : 'Enable'} auto-advance for this competition?`,
                      )
                    ) {
                      void remote.updateAutoAdvance(!remote.autoAdvance);
                    }
                  }}>
                  {remote.autoAdvance ? 'Auto-advance on' : 'Auto-advance off'}
                </Button>
              </div>

              <div
                className={classNames('space-y-4', {
                  'opacity-60': remote.isSaving,
                })}>
                {selectedRoomId === 'all' ? (
                  <RemoteGroupList
                    disabled={remote.isSaving}
                    groups={activityGroups}
                    onResetGroup={resetGroup}
                    onStartGroup={startGroup}
                    onStopGroup={stopGroup}
                  />
                ) : (
                  <RemoteActivityList
                    disabled={remote.isSaving}
                    states={activityStates}
                    onResetActivity={resetActivity}
                    onStartActivity={startActivity}
                    onStopActivity={stopActivity}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
