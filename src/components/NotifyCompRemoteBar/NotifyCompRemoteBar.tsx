import classNames from 'classnames';
import { Container } from '@/components/Container';
import { NotifyCompConnectionStatus } from '@/components/NotifyCompConnectionStatus';
import { RemoteActivitySummaryList } from '@/components/RemoteActivitySummaryList';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { useNotifyCompWebSocketStatus } from '@/hooks/useNotifyCompWebSocketStatus';
import { useNow } from '@/hooks/useNow';
import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';
import { canUseNotifyCompRemoteControls } from '@/lib/notifyCompWebSocketStatus';
import { useConfirm } from '@/providers/ConfirmProvider';
import {
  formatElapsedDuration,
  formatNextActivityOffset,
  getRemoteBarProgress,
} from './remoteBarProgress';

interface NotifyCompRemoteBarProps {
  competitionId: string;
}

const iconButtonClassName =
  'flex h-10 w-10 items-center justify-center rounded-full border border-tertiary-weak bg-panel text-lg leading-none text-default shadow-sm hover-transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700';
const primaryButtonClassName =
  'flex h-10 w-10 items-center justify-center rounded-full border border-blue-300 bg-blue-200 text-lg leading-none text-gray-900 shadow-sm hover-transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600';

export function NotifyCompRemoteBar({ competitionId }: NotifyCompRemoteBarProps) {
  const confirm = useConfirm();
  const remote = useCompetitionRemoteControl({ competitionId });
  const notifyCompWebSocketStatus = useNotifyCompWebSocketStatus();
  const now = useNow();

  if (!remote.isAuthenticated || !remote.competition || remote.scheduledActivities.length === 0) {
    return null;
  }

  const activeNames = remote.activeGroups.map((group) => group.name);
  const hasActiveGroups = activeNames.length > 0;
  const currentTitle = activeNames.length > 0 ? activeNames.join(', ') : 'No active activity';
  const nextTitle = remote.nextGroup?.name || 'No next activity';
  const elapsed = formatElapsedDuration(remote.activeGroups, now);
  const nextOffset = formatNextActivityOffset(remote.nextGroup, now);
  const progress = getRemoteBarProgress({
    activeGroups: remote.activeGroups,
    now,
  });
  const progressBarClassName = classNames('block h-full rounded-full', {
    'bg-blue-500 dark:bg-blue-400': progress.tone === 'normal',
    'bg-yellow-400 dark:bg-yellow-300': progress.tone === 'warning',
    'bg-red-500 dark:bg-red-400': progress.tone === 'overdue',
  });
  const activeActivities = remote.activeGroups.flatMap((group) => group.scheduledActivities);
  const controlsDisabled =
    remote.isSaving || !canUseNotifyCompRemoteControls(notifyCompWebSocketStatus.status);

  const confirmNextGroup = (group: RemoteActivityGroup) =>
    confirm({
      confirmLabel: 'Advance',
      message: (
        <div className="space-y-4">
          <p>
            Advance to <strong>{group.name}</strong>? This will update Live Activities for this
            competition.
          </p>
          {activeActivities.length > 0 && (
            <div className="space-y-2">
              <p className="type-label">Activities that will stop</p>
              <RemoteActivitySummaryList activities={activeActivities} roundingMinutes={1} />
            </div>
          )}
          <div className="space-y-2">
            <p className="type-label">Activities that will start</p>
            <RemoteActivitySummaryList activities={group.scheduledActivities} roundingMinutes={1} />
          </div>
        </div>
      ),
    });

  const confirmFinishCompetition = () =>
    confirm({
      confirmLabel: 'Finish competition',
      message: (
        <div className="space-y-4">
          <p>
            Finish this competition? This will set an end time for the final active Live Activities.
          </p>
          <div className="space-y-2">
            <p className="type-label">Activities that will stop</p>
            <RemoteActivitySummaryList activities={activeActivities} roundingMinutes={1} />
          </div>
        </div>
      ),
    });

  const runSwitch = async (direction: 'previous' | 'next') => {
    const group = direction === 'previous' ? remote.previousGroup : remote.nextGroup;

    if (direction === 'previous') {
      await remote.switchToPreviousGroup();
      return;
    }

    if (direction === 'next' && !group && hasActiveGroups) {
      if (await confirmFinishCompetition()) {
        await remote.finishAllActivities();
      }
      return;
    }

    if (direction === 'next' && group && !(await confirmNextGroup(group))) {
      return;
    }

    await remote.switchToGroup(group);
  };

  const togglePlayback = async () => {
    if (remote.activeGroups.length > 0) {
      await Promise.all(remote.activeGroups.map((group) => remote.stopGroup(group)));
      return;
    }

    if (remote.nextGroup && !(await confirmNextGroup(remote.nextGroup))) {
      return;
    }

    await remote.switchToGroup(remote.nextGroup);
  };

  return (
    <nav
      aria-label="Remote control"
      className="z-20 w-full border-t border-tertiary-weak bg-panel shadow-md shadow-tertiary-dark print:hidden">
      <Container
        fullWidth
        className="relative flex-row min-h-16 items-center justify-center px-2 py-2">
        <div
          className={classNames(
            'grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 md:gap-4',
            {
              'opacity-60': remote.isLoading,
            },
          )}>
          <div className="min-w-0 space-y-0.5 text-left">
            <div className="text-xs font-medium uppercase leading-none text-muted">Current</div>
            <div className="truncate text-sm font-medium text-default">{currentTitle}</div>
            {hasActiveGroups && <div className="text-sm tabular-nums text-muted">{elapsed}</div>}
          </div>

          <div className="flex w-40 flex-col justify-center space-y-1 sm:w-48 md:w-64">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className={iconButtonClassName}
                disabled={controlsDisabled || !remote.previousGroup}
                aria-label="Go back to previous remote activity"
                onClick={() => {
                  void runSwitch('previous');
                }}>
                <span className="fa fa-arrow-left" aria-hidden="true" />
              </button>

              <button
                type="button"
                className={primaryButtonClassName}
                disabled={
                  controlsDisabled || (remote.activeGroups.length === 0 && !remote.nextGroup)
                }
                aria-label={
                  remote.activeGroups.length > 0
                    ? 'Stop current remote activities'
                    : 'Start next remote activity'
                }
                onClick={() => {
                  void togglePlayback();
                }}>
                {remote.activeGroups.length > 0 ? <>&#9632;</> : <>&#9654;</>}
              </button>

              <button
                type="button"
                className={iconButtonClassName}
                disabled={controlsDisabled || (!remote.nextGroup && !hasActiveGroups)}
                aria-label={remote.nextGroup ? 'Go to next remote activity' : 'Finish competition'}
                onClick={() => {
                  void runSwitch('next');
                }}>
                <span className="fa fa-arrow-right" aria-hidden="true" />
              </button>
            </div>

            <div className="flex h-4 items-center">
              <div className="h-1 w-full overflow-hidden rounded-full bg-tertiary">
                <span className={progressBarClassName} style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-0.5 text-right">
            <div className="text-xs font-medium uppercase leading-none text-muted">Next</div>
            <div className="truncate text-sm font-medium text-default">{nextTitle}</div>
            <div className="truncate text-sm text-muted">{nextOffset}</div>
          </div>
          <NotifyCompConnectionStatus compact className="col-span-3 -mt-1" />
        </div>
      </Container>
    </nav>
  );
}
