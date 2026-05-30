import classNames from 'classnames';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { NoteBox } from '@/components/Notebox';
import { NotifyCompConnectionStatus } from '@/components/NotifyCompConnectionStatus';
import { RemoteActivitySummaryList } from '@/components/RemoteActivitySummaryList';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { useNotifyCompWebSocketStatus } from '@/hooks/useNotifyCompWebSocketStatus';
import { trackCompetitionEvent } from '@/lib/analytics';
import { isCompetitionDayOrAfter } from '@/lib/competitionDates';
import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';
import { canUseNotifyCompRemoteControls } from '@/lib/notifyCompWebSocketStatus';
import { useAuth } from '@/providers/AuthProvider';
import { useConfirm } from '@/providers/ConfirmProvider';
import { useNotifyCompRemoteAuth } from '@/providers/NotifyCompRemoteAuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';
import { RemoteGroupList } from './RemoteActivityList';
import { RemoteAutoAdvanceToggle } from './RemoteAutoAdvanceToggle';

export default function CompetitionRemote() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { wcif, setTitle } = useWCIF();
  const { user } = useAuth();
  const confirm = useConfirm();
  const remoteAuth = useNotifyCompRemoteAuth();
  const notifyCompWebSocketStatus = useNotifyCompWebSocketStatus();

  useEffect(() => {
    setTitle('Remote');
  }, [setTitle]);

  const remote = useCompetitionRemoteControl({
    competitionId: competitionId || '',
  });

  if (!competitionId || !wcif) {
    return null;
  }

  const hasStartedRemoteActivities = remote.activities.some((activity) => activity.startTime);
  const hasUnfinishedRemoteActivities = remote.activities.some(
    (activity) => activity.startTime && !activity.endTime,
  );
  const hasDoneRemoteActivityGroups = remote.activityGroups.some(
    (group) => group.status === 'done',
  );
  const hasCurrentRemoteActivityGroups = remote.activityGroups.some(
    (group) => group.status === 'current' || group.status === 'mixed',
  );
  const isCompetitionInProgressOrPast = isCompetitionDayOrAfter(wcif);
  const canResetAllActivities =
    Boolean(remote.competition) && hasDoneRemoteActivityGroups && !hasCurrentRemoteActivityGroups;
  const canFinishAllActivities =
    Boolean(remote.competition) &&
    !canResetAllActivities &&
    isCompetitionInProgressOrPast &&
    (hasUnfinishedRemoteActivities || hasCurrentRemoteActivityGroups);
  const canFinishCompetition = canFinishAllActivities && !remote.nextGroup;
  const hasFinishedAllStartedActivities =
    canResetAllActivities && isCompetitionInProgressOrPast && hasStartedRemoteActivities;
  const hasImportedEmptySchedule =
    Boolean(remote.competition) && remote.scheduledActivities.length === 0;
  const accessDenied = (Boolean(user) || remote.isAuthenticated) && !remote.canManageRemote;
  const remoteControlsDisabled =
    remote.isSaving || !canUseNotifyCompRemoteControls(notifyCompWebSocketStatus.status);

  const importCompetition = async () => {
    const confirmed = await confirm({
      confirmLabel: 'Import schedule',
      confirmVariant: 'green',
      message:
        'Import the published schedule into Live Activities Remote? This sends the schedule to NotifyComp, the backend service for Live Activities. It will not start anything.',
    });

    if (confirmed) {
      await remote.importCompetition();
      trackCompetitionEvent('live_activity_created', {
        competition_id: competitionId,
        feature: 'live_activities',
        user_id: user?.id,
      });
    }
  };

  const selectGroup = async (group: RemoteActivityGroup) => {
    const action =
      group.status === 'done'
        ? 'reset'
        : group.status === 'current' || group.status === 'mixed'
          ? 'stop'
          : 'start';
    const actionLabel = {
      reset: 'Reset',
      start: 'Start',
      stop: 'Stop',
    }[action];
    const confirmed = await confirm({
      confirmLabel: actionLabel,
      confirmVariant: action === 'start' ? 'green' : 'gray',
      message: (
        <div className="space-y-4">
          <p>
            This will {action} activity: <strong>{group.name}</strong>
          </p>
          <RemoteActivitySummaryList activities={group.scheduledActivities} />
          {action === 'reset' && (
            <p>The start and stop times will reset as if the activity never happened.</p>
          )}
        </div>
      ),
    });

    if (!confirmed) {
      return;
    }

    if (action === 'start') {
      await remote.startGroup(group);
      return;
    }

    if (action === 'reset') {
      await remote.resetGroup(group);
      return;
    }

    await remote.stopGroup(group);
  };

  return (
    <Container className="px-4 py-8">
      <div className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="type-body-sm text-subtle">
            Remote controls Live Activities for this competition. NotifyComp handles the backend
            updates so staff can start, stop, and advance activities from Competition Groups.
          </p>
          <Link to="/live-activities" className="link-inline type-body-sm">
            Learn how Live Activities work
          </Link>
        </div>

        {remoteAuth.error && <NoteBox prefix="Remote sign in" text={remoteAuth.error} />}

        {accessDenied ? (
          <NoteBox
            prefix="Remote access"
            text="Only listed delegates and organizers for this competition can access Remote."
          />
        ) : !remote.isAuthenticated ? (
          <div className="space-y-4">
            <p className="max-w-3xl type-body-sm text-subtle">
              Sign in to Live Activities Remote with your WCA account to connect these controls to
              this competition. This sign-in is separate from Competition Groups because the live
              updates are backed by NotifyComp.
            </p>
            <Button
              type="button"
              disabled={remoteAuth.authenticating}
              onClick={() => {
                void remoteAuth.signIn(competitionId);
              }}>
              {remoteAuth.authenticating ? 'Signing in...' : 'Sign in to Live Activities Remote'}
            </Button>
          </div>
        ) : (
          <>
            {remote.isLoading && <BarLoader width="100%" />}
            {remote.error && <NoteBox prefix="Remote error" text={remote.error} />}
            {remote.competition && (
              <div className="space-y-4">
                <NotifyCompConnectionStatus />
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-tertiary-weak bg-panel p-4">
                  <div className="space-y-1">
                    <h2 className="type-label">Webhooks</h2>
                    <p className="type-body-sm text-subtle">
                      Configure external Live Activities update webhooks on a separate page.
                    </p>
                  </div>
                  <Link
                    to={`/competitions/${competitionId}/admin/webhooks`}
                    className="btn btn-gray inline-flex shrink-0">
                    Manage webhooks
                  </Link>
                </div>
              </div>
            )}

            {!remote.isLoading && !remote.competition ? (
              <div className="space-y-4">
                <NoteBox
                  prefix="Not imported"
                  text="Import the published schedule before using Remote. Importing creates the Live Activities schedule but does not start or change any activity status."
                />
                <Button
                  type="button"
                  disabled={remoteControlsDisabled}
                  onClick={() => {
                    void importCompetition();
                  }}>
                  {remote.isSaving ? 'Importing...' : 'Import schedule'}
                </Button>
              </div>
            ) : hasImportedEmptySchedule ? (
              <NoteBox
                prefix="No activities"
                text="This competition is imported, but the published schedule does not include any room activities to control."
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <h2 className="type-heading">All rooms</h2>
                  <div className="flex items-start gap-2">
                    <div className="space-y-1 text-right">
                      <div className="type-meta text-muted">Auto-advance</div>
                      <div className="max-w-sm type-meta text-subtle">
                        Automatically moves Live Activities to the next scheduled group when the
                        current group ends.
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <RemoteAutoAdvanceToggle
                        checked={Boolean(remote.autoAdvance)}
                        disabled={remoteControlsDisabled}
                        onToggle={() => {
                          void (async () => {
                            const autoAdvance = !remote.autoAdvance;
                            const confirmed = await confirm({
                              confirmLabel: autoAdvance ? 'Enable' : 'Disable',
                              message: autoAdvance
                                ? 'Enable auto-advance for this competition? Live Activities Remote will move to the next scheduled group when the current group ends.'
                                : 'Disable auto-advance for this competition? Staff will need to advance Live Activities manually.',
                            });

                            if (confirmed) {
                              await remote.updateAutoAdvance(autoAdvance);
                            }
                          })();
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={classNames('space-y-4', {
                    'opacity-60': remote.isSaving,
                  })}>
                  <RemoteGroupList
                    disabled={remoteControlsDisabled}
                    groups={remote.activityGroups}
                    onSelectGroup={(group) => {
                      void selectGroup(group);
                    }}
                  />
                </div>

                {(canResetAllActivities || canFinishAllActivities) && (
                  <div className="border-t border-tertiary-weak pt-4 text-right">
                    {canFinishAllActivities ? (
                      <Button
                        type="button"
                        variant="gray"
                        disabled={remoteControlsDisabled}
                        onClick={() => {
                          void (async () => {
                            const confirmed = await confirm({
                              confirmLabel: canFinishCompetition
                                ? 'Finish competition'
                                : 'Finish all activities',
                              confirmVariant: 'gray',
                              message: canFinishCompetition
                                ? 'Finish this competition? This will set an end time for the final active Live Activity.'
                                : 'Finish all active Live Activities for this competition? This will set an end time for every activity that has started and is still running.',
                            });

                            if (confirmed) {
                              await remote.finishAllActivities();
                            }
                          })();
                        }}>
                        {canFinishCompetition ? 'Finish competition' : 'Finish all activities'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="gray"
                        disabled={remoteControlsDisabled}
                        onClick={() => {
                          void (async () => {
                            const confirmed = await confirm({
                              confirmLabel: 'Reset all activities',
                              confirmVariant: 'gray',
                              message:
                                'Reset all Live Activities for this competition? This will clear every remote start and stop time.',
                            });

                            if (confirmed) {
                              await remote.resetAllActivities();
                            }
                          })();
                        }}>
                        Reset all activities
                      </Button>
                    )}
                  </div>
                )}

                {hasFinishedAllStartedActivities && (
                  <NoteBox
                    prefix="All finished"
                    text="Every started Live Activity has an end time. There are no active activities to finish."
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
