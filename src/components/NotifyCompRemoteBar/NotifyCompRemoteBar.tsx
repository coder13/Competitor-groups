import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';

interface NotifyCompRemoteBarProps {
  competitionId: string;
}

const groupLabel = (count: number) => `${count} active activit${count === 1 ? 'y' : 'ies'}`;
const iconButtonClassName =
  'flex h-8 w-8 items-center justify-center rounded-full border border-tertiary-weak bg-panel text-base leading-none text-default shadow-sm hover-transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700 md:h-9 md:w-9 md:text-lg';
const primaryButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-full border border-blue-300 bg-blue-200 text-base leading-none text-gray-900 shadow-sm hover-transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-600 dark:bg-blue-700 dark:text-white dark:hover:bg-blue-600 md:h-10 md:w-10 md:text-lg';

const confirmNextGroup = (groupName: string) =>
  window.confirm(`Advance to ${groupName}? This will update the live remote activity.`);

export function NotifyCompRemoteBar({ competitionId }: NotifyCompRemoteBarProps) {
  const remote = useCompetitionRemoteControl({ competitionId });

  if (!remote.isAuthenticated || !remote.competition || remote.scheduledActivities.length === 0) {
    return null;
  }

  const activeNames = remote.activeGroups.map((group) => group.name);
  const title = activeNames.length > 0 ? activeNames.join(', ') : 'No active activities';
  const detail =
    activeNames.length > 0
      ? groupLabel(activeNames.length)
      : remote.nextGroup
        ? `Next: ${remote.nextGroup.name}`
        : 'Remote overview';
  const completedGroups = remote.activityGroups.filter((group) => group.status === 'done').length;
  const progress =
    remote.activityGroups.length > 0 ? (completedGroups / remote.activityGroups.length) * 100 : 0;

  const runSwitch = (direction: 'previous' | 'next') => {
    const group = direction === 'previous' ? remote.previousGroup : remote.nextGroup;

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
        <Link
          to={`/competitions/${competitionId}/remote`}
          className="absolute left-2 top-1/2 hidden max-w-[min(32vw,20rem)] -translate-y-1/2 rounded px-1 py-1 hover-transition hover:bg-gray-100 dark:hover:bg-gray-700 sm:block">
          <div className="min-w-0 space-y-1">
            <div className="truncate text-sm font-medium text-default">{title}</div>
            <div className="truncate text-xs text-muted">{detail}</div>
          </div>
        </Link>

        <div className="w-full max-w-sm space-y-1">
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
              disabled={remote.isSaving || (remote.activeGroups.length === 0 && !remote.nextGroup)}
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

          <Link
            to={`/competitions/${competitionId}/remote`}
            className={classNames('grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2', {
              'opacity-60': remote.isLoading,
            })}>
            <span className="text-right text-xs tabular-nums text-muted">{completedGroups}</span>
            <span className="h-1 overflow-hidden rounded-full bg-tertiary">
              <span
                className="block h-full rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${progress}%` }}
              />
            </span>
            <span className="text-xs tabular-nums text-muted">{remote.activityGroups.length}</span>
          </Link>
        </div>
      </Container>
    </nav>
  );
}
