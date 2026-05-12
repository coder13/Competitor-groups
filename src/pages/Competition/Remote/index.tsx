import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button, Container, NoteBox } from '@/components';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { getRooms } from '@/lib/activities';
import { RemoteActivityState } from '@/lib/notifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteAction, RemoteActionDialog } from './RemoteActionDialog';
import { RemoteActivityList } from './RemoteActivityList';

const confirmAction = (message: string) => window.confirm(message);

interface PendingRemoteAction {
  action: RemoteAction;
  activityName: string;
  onConfirm: () => void;
  roomNames: string[];
}

export default function CompetitionRemote() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { wcif, setTitle } = useWCIF();
  const remoteAuth = useNotifyCompRemoteAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingRemoteAction | null>(null);

  useEffect(() => {
    setTitle('Remote');
  }, [setTitle]);

  const rooms = useMemo(() => (wcif ? getRooms(wcif) : []), [wcif]);
  const roomId = selectedRoomId ?? rooms[0]?.id;
  const remote = useCompetitionRemoteControl({
    competitionId: competitionId || '',
    roomId,
  });

  if (!competitionId || !wcif) {
    return null;
  }

  const selectActivity = (state: RemoteActivityState) => {
    if (state.status === 'done') {
      return;
    }

    const action = state.status === 'current' ? 'stop' : 'start';

    setPendingAction({
      action,
      activityName: state.scheduledActivity.name,
      onConfirm: () => {
        if (action === 'start') {
          void remote.startActivity(state.scheduledActivity.id);
          return;
        }

        void remote.stopActivity(state.scheduledActivity.id);
      },
      roomNames: [state.scheduledActivity.room.name],
    });
  };

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <p className="max-w-3xl type-body-sm text-subtle">
          Remote control uses NotifyComp to manage the live activity status for this competition, so
          staff can start, stop, and advance activities from Competition Groups.
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
                    <select
                      aria-label="Select remote room"
                      className="select min-w-48"
                      value={roomId ?? ''}
                      onChange={(event) => setSelectedRoomId(Number(event.target.value))}>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
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
                  <RemoteActivityList
                    disabled={remote.isSaving}
                    states={remote.activityStates}
                    onSelectActivity={selectActivity}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {pendingAction && (
        <RemoteActionDialog
          action={pendingAction.action}
          activityName={pendingAction.activityName}
          disabled={remote.isSaving}
          roomNames={pendingAction.roomNames}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            pendingAction.onConfirm();
            setPendingAction(null);
          }}
        />
      )}
    </Container>
  );
}
