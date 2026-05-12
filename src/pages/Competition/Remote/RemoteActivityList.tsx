import classNames from 'classnames';
import { formatDuration, intervalToDuration } from 'date-fns';
import { NoteBox } from '@/components';
import { RoomPill } from '@/components/Pill';
import { useNow } from '@/hooks/useNow';
import { activityCodeToName } from '@/lib/activityCodes';
import {
  RemoteActivityGroup,
  RemoteScheduledActivity,
  RemoteActivityState,
  splitRemoteActivityGroups,
  splitRemoteActivityStates,
} from '@/lib/notifyCompRemoteActivities';
import { formatTime, formatTimeRange } from '@/lib/time';

const REMOTE_TIME_ROUNDING_MINUTES = 1;

const formatStartedDuration = (startTime: string, now: Date) => {
  const { hours, minutes } = intervalToDuration({
    start: new Date(startTime),
    end: now,
  });

  return formatDuration({ hours, minutes }) || 'now';
};

const stateDescription = (state: RemoteActivityState, now: Date) => {
  const timeZone = groupTimeZone(state.scheduledActivity);

  if (state.liveActivity?.startTime && !state.liveActivity.endTime) {
    return `Started ${formatStartedDuration(state.liveActivity.startTime, now)} ago`;
  }

  if (state.liveActivity?.endTime) {
    return `Ended at ${formatTime(
      state.liveActivity.endTime,
      REMOTE_TIME_ROUNDING_MINUTES,
      timeZone,
    )}`;
  }

  return `Should start at ${formatTime(
    state.scheduledActivity.startTime,
    REMOTE_TIME_ROUNDING_MINUTES,
    timeZone,
  )}`;
};

const groupActivityName = (activity: RemoteScheduledActivity) =>
  activity.activityCode.startsWith('other')
    ? activity.name
    : activityCodeToName(activity.activityCode);

const groupRooms = (group: RemoteActivityGroup) =>
  Array.from(
    new Map(
      group.scheduledActivities.map((activity) => [activity.room.id, activity.room]),
    ).values(),
  );

const groupTimeZone = (activity: RemoteScheduledActivity) =>
  (activity.room as RemoteScheduledActivity['room'] & { venue?: { timezone?: string } }).venue
    ?.timezone;

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
              const firstActivity = group.scheduledActivities[0];
              const rooms = groupRooms(group);

              return (
                <button
                  key={`${group.id}-${activityIds.join('-')}`}
                  type="button"
                  disabled={disabled}
                  className={classNames(
                    'flex w-full flex-col p-2 text-left type-body even:table-bg-row-alt hover:table-bg-row-hover disabled:cursor-default disabled:opacity-60',
                    {
                      'opacity-50': group.status === 'done',
                    },
                  )}
                  onClick={() => onSelectGroup(group)}>
                  <span className="type-body">
                    {firstActivity ? groupActivityName(firstActivity) : group.name}
                  </span>
                  <span className="flex items-start justify-between gap-4 type-meta">
                    <span className="flex min-w-0 flex-wrap gap-2">
                      {rooms.map((room) => (
                        <RoomPill
                          key={room.id}
                          className="px-1"
                          style={{
                            backgroundColor: `${room.color}70`,
                          }}>
                          {room.name}
                        </RoomPill>
                      ))}
                    </span>
                    {firstActivity && (
                      <span className="ml-auto shrink-0 whitespace-nowrap text-right">
                        {formatTimeRange(
                          firstActivity.startTime,
                          firstActivity.endTime,
                          REMOTE_TIME_ROUNDING_MINUTES,
                          groupTimeZone(firstActivity),
                        )}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
