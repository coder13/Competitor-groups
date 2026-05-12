import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';

interface NotifyCompRemoteBarProps {
  competitionId: string;
}

const groupLabel = (count: number) => `${count} active activit${count === 1 ? 'y' : 'ies'}`;
const iconButtonClassName =
  'flex h-8 w-8 items-center justify-center rounded-full text-base leading-none text-gray-200 hover-transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:w-9 md:text-lg';
const primaryButtonClassName =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white text-base leading-none text-gray-950 hover-transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 md:h-10 md:w-10 md:text-lg';

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
    void remote.switchToGroup(group);
  };
  const togglePlayback = () => {
    if (remote.activeGroups.length > 0) {
      void Promise.all(remote.activeGroups.map((group) => remote.stopGroup(group)));
      return;
    }

    void remote.switchToGroup(remote.nextGroup);
  };

  return (
    <nav
      aria-label="Remote control"
      className="z-20 w-full border-t border-gray-800 bg-black text-white shadow-md print:hidden">
      <Container className="grid grid-cols-[minmax(0,1fr)_minmax(176px,1.2fr)_auto] items-center gap-2 px-2 py-2 md:grid-cols-[minmax(0,1fr)_minmax(220px,1.4fr)_minmax(0,1fr)] md:gap-4">
        <Link
          to={`/competitions/${competitionId}/remote`}
          className="flex min-w-0 items-center gap-2 rounded px-1 py-1 hover-transition hover:bg-gray-900">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-green-600 text-sm font-bold text-white">
            RC
          </div>
          <div className="min-w-0 space-y-1">
            <div className="truncate text-sm font-medium text-white">{title}</div>
            <div className="truncate text-xs text-gray-400">{detail}</div>
          </div>
        </Link>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              className={iconButtonClassName}
              disabled={remote.isSaving || !remote.previousGroup}
              aria-label="Go back to previous remote activity"
              onClick={() => runSwitch('previous')}>
              &#9198;
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
              &#9197;
            </button>
          </div>

          <Link
            to={`/competitions/${competitionId}/remote`}
            className={classNames('grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2', {
              'opacity-60': remote.isLoading,
            })}>
            <span className="text-right text-xs tabular-nums text-gray-400">{completedGroups}</span>
            <span className="h-1 overflow-hidden rounded-full bg-gray-700">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </span>
            <span className="text-xs tabular-nums text-gray-400">
              {remote.activityGroups.length}
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <div className="truncate text-sm font-medium text-white">Remote</div>
            <div className="truncate text-xs text-gray-400">
              {remote.error ? remote.error : remote.isSaving ? 'Syncing' : 'Ready'}
            </div>
          </div>
          <Link
            to={`/competitions/${competitionId}/remote`}
            className="rounded border border-green-500 px-3 py-1 text-sm font-medium text-green-400 hover-transition hover:bg-green-950">
            Open
          </Link>
        </div>
      </Container>
    </nav>
  );
}
