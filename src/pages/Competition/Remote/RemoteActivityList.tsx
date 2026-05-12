import { formatDuration, intervalToDuration } from 'date-fns';
import { NoteBox } from '@/components';
import { useNow } from '@/hooks/useNow';
import {
  RemoteActivityGroup,
  RemoteActivityState,
  splitRemoteActivityGroups,
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

  return `Should start at ${formatTime(state.scheduledActivity.startTime)}`;
};

const activityCountText = (count: number) => `${count} ${count === 1 ? 'activity' : 'activities'}`;

interface RemoteActivityListProps {
  disabled?: boolean;
  onSelectActivity: (state: RemoteActivityState) => void;
  states: RemoteActivityState[];
}

export function RemoteActivityList({
  disabled,
  onSelectActivity,
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
          <div className="divide-y divide-tertiary-weak">
            {section.items.map((state) => (
              <button
                key={state.scheduledActivity.id}
                type="button"
                disabled={disabled || state.status === 'done'}
                className="block w-full py-4 text-left hover-transition hover:bg-gray-100 disabled:cursor-default disabled:opacity-70 dark:hover:bg-gray-700"
                onClick={() => onSelectActivity(state)}>
                <div className="space-y-1">
                  <div className="type-label">{state.scheduledActivity.name}</div>
                  <div className="type-meta">
                    {state.scheduledActivity.room.name} - {stateDescription(state, now)}
                  </div>
                </div>
              </button>
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
  onSelectGroup: (group: RemoteActivityGroup) => void;
}

export function RemoteGroupList({ disabled, groups, onSelectGroup }: RemoteGroupListProps) {
  const groupedStates = splitRemoteActivityGroups(groups);
  const sections: Array<{
    emptyText?: string;
    items: RemoteActivityGroup[];
    title: string;
  }> = [
    {
      items: groupedStates.current,
      title: 'Current',
    },
    {
      emptyText: 'No upcoming activities remain.',
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
          <div className="divide-y divide-tertiary-weak">
            {section.items.map((group) => {
              const activityIds = group.scheduledActivities.map((activity) => activity.id);
              const rooms = [
                ...new Set(group.scheduledActivities.map((activity) => activity.room.name)),
              ];

              return (
                <button
                  key={`${group.id}-${activityIds.join('-')}`}
                  type="button"
                  disabled={disabled || group.status === 'done'}
                  className="block w-full py-4 text-left hover-transition hover:bg-gray-100 disabled:cursor-default disabled:opacity-70 dark:hover:bg-gray-700"
                  onClick={() => onSelectGroup(group)}>
                  <div className="space-y-1">
                    <div className="type-label">{group.name}</div>
                    <div className="type-meta">
                      {rooms.join(', ')} - {activityCountText(group.scheduledActivities.length)} -{' '}
                      {group.status}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
