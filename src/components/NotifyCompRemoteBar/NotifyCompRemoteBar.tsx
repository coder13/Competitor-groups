import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useCompetitionRemoteControl } from '@/hooks/useCompetitionRemoteControl';

interface NotifyCompRemoteBarProps {
  competitionId: string;
}

const groupLabel = (count: number) => `${count} active activit${count === 1 ? 'y' : 'ies'}`;

export function NotifyCompRemoteBar({ competitionId }: NotifyCompRemoteBarProps) {
  const remote = useCompetitionRemoteControl({ competitionId });

  if (!remote.isAuthenticated || remote.scheduledActivities.length === 0) {
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

  const runSwitch = (direction: 'previous' | 'next') => {
    const group = direction === 'previous' ? remote.previousGroup : remote.nextGroup;
    void remote.switchToGroup(group);
  };

  return (
    <nav
      aria-label="Remote control"
      className="z-20 w-full border-t border-tertiary-weak bg-panel shadow-md shadow-tertiary-dark print:hidden">
      <Container className="flex-row items-center gap-2 px-2 py-2">
        <Button
          type="button"
          variant="light"
          className="min-w-[76px] justify-center"
          disabled={remote.isSaving || !remote.previousGroup}
          onClick={() => runSwitch('previous')}>
          Back
        </Button>

        <Link
          to={`/competitions/${competitionId}/remote`}
          className={classNames(
            'min-w-0 flex-1 rounded border border-tertiary-weak px-3 py-2 hover-transition hover:bg-gray-100 dark:hover:bg-gray-700',
            {
              'opacity-60': remote.isLoading,
            },
          )}>
          <div className="flex min-w-0 flex-col">
            <span className="truncate type-label">{title}</span>
            <span className="truncate type-meta">
              {remote.error ? `Remote error: ${remote.error}` : detail}
            </span>
          </div>
        </Link>

        <Button
          type="button"
          variant="green"
          className="min-w-[76px] justify-center"
          disabled={remote.isSaving || !remote.nextGroup}
          onClick={() => runSwitch('next')}>
          Next
        </Button>
      </Container>
    </nav>
  );
}
