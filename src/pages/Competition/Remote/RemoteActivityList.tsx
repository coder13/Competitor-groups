import { formatDuration, intervalToDuration } from 'date-fns';
import { Button, NoteBox } from '@/components';
import { useNow } from '@/hooks/useNow';
import {
  RemoteActivityGroup,
  RemoteActivityState,
  splitRemoteActivityStates,
} from '@/lib/notifyCompRemoteActivities';
import { formatTime } from '@/lib/time';

const formatStartedDuration = (startTime: string, now: Date) => {
  const { hours, minutes } = intervalToDuration({
    start: new Date(startTime),
    end: now,
  });

  return formatDuration({ hours, minutes }) || 'now';
};

const stateDescription = (state: RemoteActivityState, now: Date) => {
  if (state.liveActivity?.startTime && !state.liveActivity.endTime) {
    return `Started ${formatStartedDuration(state.liveActivity.startTime, now)} ago`;
  }

  if (state.liveActivity?.endTime) {
    return `Ended at ${formatTime(state.liveActivity.endTime)}`;
  }

  return `Scheduled for ${formatTime(state.scheduledActivity.startTime)}`;
};

interface RemoteActivityListProps {
  disabled?: boolean;
  onResetActivity: (state: RemoteActivityState) => void;
  onStartActivity: (state: RemoteActivityState) => void;
  onStopActivity: (state: RemoteActivityState) => void;
  states: RemoteActivityState[];
}

export function RemoteActivityList({
  disabled,
  onResetActivity,
  onStartActivity,
  onStopActivity,
  states,
}: RemoteActivityListProps) {
  const now = useNow();
  const groupedStates = splitRemoteActivityStates(states);

  const sections: Array<{
    emptyText?: string;
    items: RemoteActivityState[];
    title: string;
  }> = [
    {
      items: groupedStates.current,
      title: 'Current',
    },
    {
      emptyText: 'No upcoming activities remain for this room.',
      items: groupedStates.next,
      title: 'Next',
    },
    {
      items: groupedStates.done,
      title: 'Done',
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h3 className="type-heading">{section.title}</h3>
          {section.items.length === 0 && section.emptyText && (
            <NoteBox prefix="" text={section.emptyText} />
          )}
          <div className="space-y-2">
            {section.items.map((state) => (
              <div
                key={state.scheduledActivity.id}
                className="flex flex-col gap-2 rounded border border-tertiary-weak bg-panel p-2 shadow-md shadow-tertiary-dark md:flex-row md:items-center">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="type-label">{state.scheduledActivity.name}</div>
                  <div className="type-meta">
                    {state.scheduledActivity.room.name} - {stateDescription(state, now)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state.status === 'current' ? (
                    <Button
                      type="button"
                      variant="gray"
                      disabled={disabled}
                      onClick={() => onStopActivity(state)}>
                      Stop
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="green"
                      disabled={disabled || state.status === 'done'}
                      onClick={() => onStartActivity(state)}>
                      Start
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="light"
                    disabled={disabled}
                    onClick={() => onResetActivity(state)}>
                    Reset
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface RemoteGroupListProps {
  disabled?: boolean;
  groups: RemoteActivityGroup[];
  onResetGroup: (group: RemoteActivityGroup) => void;
  onStartGroup: (group: RemoteActivityGroup) => void;
  onStopGroup: (group: RemoteActivityGroup) => void;
}

export function RemoteGroupList({
  disabled,
  groups,
  onResetGroup,
  onStartGroup,
  onStopGroup,
}: RemoteGroupListProps) {
  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const activityIds = group.scheduledActivities.map((activity) => activity.id);
        const rooms = [...new Set(group.scheduledActivities.map((activity) => activity.room.name))];

        return (
          <div
            key={`${group.id}-${activityIds.join('-')}`}
            className="flex flex-col gap-2 rounded border border-tertiary-weak bg-panel p-2 shadow-md shadow-tertiary-dark md:flex-row md:items-center">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="type-label">{group.name}</div>
              <div className="type-meta">
                {rooms.join(', ')} - {group.scheduledActivities.length} activit
                {group.scheduledActivities.length === 1 ? 'y' : 'ies'} - {group.status}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.status === 'current' ? (
                <Button
                  type="button"
                  variant="gray"
                  disabled={disabled}
                  onClick={() => onStopGroup(group)}>
                  Stop
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="green"
                  disabled={disabled || group.status === 'done'}
                  onClick={() => onStartGroup(group)}>
                  Start
                </Button>
              )}
              <Button
                type="button"
                variant="light"
                disabled={disabled}
                onClick={() => onResetGroup(group)}>
                Reset
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
