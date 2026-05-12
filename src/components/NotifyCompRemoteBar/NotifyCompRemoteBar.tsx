import classNames from 'classnames';
import { Container } from '@/components/Container';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';
import { useNow } from '@/hooks/useNow';
import {
  formatElapsedMMSS,
  formatNextActivityOffset,
  getActiveGroupStartTime,
  getRemoteBarProgress,
} from './remoteBarProgress';

interface NotifyCompRemoteBarProps {
  competitionId: string;
}

const iconButtonClassName =
  'flex h-8 w-8 items-center justify-center rounded-full border border-tertiary-weak bg-panel text-base leading-none text-default shadow-sm hover-transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700 md:h-9 md:w-9 md:text-lg';
const primaryButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-200 text-base leading-none text-gray-900 shadow-sm hover-transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600 md:h-10 md:w-10 md:text-lg';

const confirmNextGroup = (groupName: string) =>
  window.confirm(`Advance to ${groupName}? This will update the live remote activity.`);

export function NotifyCompRemoteBar({ competitionId }: NotifyCompRemoteBarProps) {
  const remote = useCompetitionRemoteControl({ competitionId });
  const now = useNow();

  if (!remote.isAuthenticated || !remote.competition || remote.scheduledActivities.length === 0) {
    return null;
  }

  const activeNames = remote.activeGroups.map((group) => group.name);
  const currentTitle = activeNames.length > 0 ? activeNames.join(', ') : 'No active activity';
  const nextTitle = remote.nextGroup?.name || 'No next activity';
  const elapsed = formatElapsedMMSS(getActiveGroupStartTime(remote.activeGroups), now);
  const nextOffset = formatNextActivityOffset(remote.nextGroup, now);
  const progress = getRemoteBarProgress({
    activeGroups: remote.activeGroups,
    nextGroup: remote.nextGroup,
    now,
  });

  const runSwitch = (direction: 'previous' | 'next') => {
    const group = direction === 'previous' ? remote.previousGroup : remote.nextGroup;

    if (direction === 'previous') {
      void remote.switchToPreviousGroup();
      return;
    }

    if (direction === 'next' && group && !confirmNextGroup(group.name)) {
      return;
    }

    void remote.switchToGroup(group);
  };

  const togglePlayback = () => {
    if (remote.activeGroups.length > 0) {
      void Promise.all(remote.activeGroups.map((group) => remote.stopGroup(group)));
      return;
    }

    if (remote.nextGroup && !confirmNextGroup(remote.nextGroup.name)) {
      return;
    }

    void remote.switchToGroup(remote.nextGroup);
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
            <div className="text-sm tabular-nums text-muted">{elapsed}</div>
          </div>

          <div className="flex w-28 flex-col justify-center space-y-1 sm:w-40 md:w-64">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className={iconButtonClassName}
                disabled={remote.isSaving || !remote.previousGroup}
                aria-label="Go back to previous remote activity"
                onClick={() => runSwitch('previous')}>
                <span className="fa fa-arrow-left" aria-hidden="true" />
              </button>

              <button
                type="button"
                className={primaryButtonClassName}
                disabled={
                  remote.isSaving || (remote.activeGroups.length === 0 && !remote.nextGroup)
                }
                aria-label={
                  remote.activeGroups.length > 0
                    ? 'Stop current remote activities'
                    : 'Start next remote activity'
                }
                onClick={togglePlayback}>
                {remote.activeGroups.length > 0 ? <>&#9632;</> : <>&#9654;</>}
              </button>

              <button
                type="button"
                className={iconButtonClassName}
                disabled={remote.isSaving || !remote.nextGroup}
                aria-label="Go to next remote activity"
                onClick={() => runSwitch('next')}>
                <span className="fa fa-arrow-right" aria-hidden="true" />
              </button>
            </div>

            <div className="flex h-4 items-center">
              <div className="h-1 w-full overflow-hidden rounded-full bg-tertiary">
                <span
                  className="block h-full rounded-full bg-blue-500 dark:bg-blue-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-0.5 text-right">
            <div className="text-xs font-medium uppercase leading-none text-muted">Next</div>
            <div className="truncate text-sm font-medium text-default">{nextTitle}</div>
            <div className="truncate text-sm text-muted">{nextOffset}</div>
          </div>
        </div>
      </Container>
    </nav>
  );
}
