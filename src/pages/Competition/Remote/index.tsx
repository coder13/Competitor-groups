import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button, Container, NoteBox } from '@/components';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { getRooms } from '@/lib/activities';
import { RemoteActivityGroup, RemoteActivityState } from '@/lib/notifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteActivityList, RemoteGroupList } from './RemoteActivityList';

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
  const remote = useCompetitionRemoteControl({
    competitionId: competitionId || '',
    roomId,
  });

  if (!competitionId || !wcif) {
    return null;
  }

  const startActivity = (state: RemoteActivityState) => {
    void remote.startActivity(state.scheduledActivity.id);
  };

  const stopActivity = (state: RemoteActivityState) => {
    void remote.stopActivity(state.scheduledActivity.id);
  };

  const toggleActivity = (state: RemoteActivityState) => {
    if (state.status === 'current') {
      stopActivity(state);
      return;
    }

    startActivity(state);
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
    void remote.startGroup(group);
  };

  const stopGroup = (group: RemoteActivityGroup) => {
    void remote.stopGroup(group);
  };

  const toggleGroup = (group: RemoteActivityGroup) => {
    if (group.status === 'current' || group.status === 'mixed') {
      stopGroup(group);
      return;
    }

    startGroup(group);
  };

  const resetGroup = (group: RemoteActivityGroup) => {
    if (!confirmAction(`Reset ${group.name} in all listed rooms?`)) {
      return;
    }

    void remote.resetGroup(group);
  };

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <p className="max-w-3xl type-body-sm text-subtle">
          Remote control uses NotifyComp to manage the live activity status for this competition, so
          staff can start, stop, reset, and advance activities from Competition Groups.
        </p>

        {remoteAuth.error && <NoteBox prefix="Remote sign in" text={remoteAuth.error} />}

        {!remote.isAuthenticated ? (
          <div className="space-y-4">
            <p className="max-w-3xl type-body-sm text-subtle">
              Sign in to NotifyComp Remote with your WCA account to connect these controls to this
              competition; signing in does not import the competition or start any activities.
            </p>
            <Button
              type="button"
              disabled={remoteAuth.authenticating}
              onClick={() => {
                void remoteAuth.signIn(competitionId);
              }}>
              {remoteAuth.authenticating ? 'Signing in...' : 'Sign in to NotifyComp Remote'}
            </Button>
          </div>
        ) : (
          <>
            {remote.isLoading && <BarLoader width="100%" />}
            {remote.error && <NoteBox prefix="Remote error" text={remote.error} />}

            {!remote.isLoading && !remote.competition ? (
              <Button
                type="button"
                disabled={remote.isSaving}
                onClick={() => {
                  void remote.importCompetition();
                }}>
                {remote.isSaving ? 'Importing...' : 'Import to notifycomp'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex flex-col gap-1 min-w-48 type-label">
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
                      groups={remote.activityGroups}
                      onResetGroup={resetGroup}
                      onStartGroup={startGroup}
                      onStopGroup={stopGroup}
                      onToggleGroup={toggleGroup}
                    />
                  ) : (
                    <RemoteActivityList
                      disabled={remote.isSaving}
                      states={remote.activityStates}
                      onResetActivity={resetActivity}
                      onStartActivity={startActivity}
                      onStopActivity={stopActivity}
                      onToggleActivity={toggleActivity}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
