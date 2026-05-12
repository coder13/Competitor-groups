import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button, Container, NoteBox } from '@/components';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteAction, RemoteActionDialog } from './RemoteActionDialog';
import { RemoteGroupList } from './RemoteActivityList';

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
  const [pendingAction, setPendingAction] = useState<PendingRemoteAction | null>(null);

  useEffect(() => {
    setTitle('Remote');
  }, [setTitle]);

  const remote = useCompetitionRemoteControl({
    competitionId: competitionId || '',
  });

  if (!competitionId || !wcif) {
    return null;
  }

  const selectGroup = (group: RemoteActivityGroup) => {
    const action =
      group.status === 'done'
        ? 'reset'
        : group.status === 'current' || group.status === 'mixed'
          ? 'stop'
          : 'start';
    const roomNames = [...new Set(group.scheduledActivities.map((activity) => activity.room.name))];

    setPendingAction({
      action,
      activityName: group.name,
      onConfirm: () => {
        if (action === 'start') {
          void remote.startGroup(group);
          return;
        }

        if (action === 'reset') {
          void remote.resetGroup(group);
          return;
        }

        void remote.stopGroup(group);
      },
      roomNames,
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
                  <h2 className="type-heading">All rooms</h2>
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
                  <RemoteGroupList
                    disabled={remote.isSaving}
                    groups={remote.activityGroups}
                    onSelectGroup={selectGroup}
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
