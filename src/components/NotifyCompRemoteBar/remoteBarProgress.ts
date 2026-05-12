import { RemoteActivityGroup } from '@/lib/notifyCompRemoteActivities';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const getTime = (isoString?: string | null) => {
  if (!isoString) {
    return undefined;
  }

  const time = new Date(isoString).getTime();
  return Number.isNaN(time) ? undefined : time;
};

const getEarliestTime = (times: Array<number | undefined>) => {
  const validTimes = times.filter((time): time is number => time !== undefined);
  return validTimes.length ? Math.min(...validTimes) : undefined;
};

const getLatestTime = (times: Array<number | undefined>) => {
  const validTimes = times.filter((time): time is number => time !== undefined);
  return validTimes.length ? Math.max(...validTimes) : undefined;
};

export const formatElapsedMMSS = (startTime: number | string | undefined, now: Date) => {
  const start = typeof startTime === 'number' ? startTime : getTime(startTime);

  if (start === undefined) {
    return '00:00';
  }

  const elapsedSeconds = Math.max(0, Math.floor((now.getTime() - start) / SECOND));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getGroupScheduledStartTime = (group?: RemoteActivityGroup) =>
  getEarliestTime(group?.scheduledActivities.map((activity) => getTime(activity.startTime)) || []);

const getActiveGroupsScheduledStartTime = (groups: RemoteActivityGroup[]) =>
  getEarliestTime(
    groups.flatMap((group) =>
      group.scheduledActivities.map((activity) => getTime(activity.startTime)),
    ),
  );

const getActiveGroupsScheduledEndTime = (groups: RemoteActivityGroup[]) =>
  getLatestTime(
    groups.flatMap((group) =>
      group.scheduledActivities.map((activity) => getTime(activity.endTime)),
    ),
  );

export const getActiveGroupStartTime = (groups: RemoteActivityGroup[]) =>
  getEarliestTime(
    groups.flatMap((group) => {
      const liveStartTimes = group.liveActivities
        .filter((activity) => activity.startTime && !activity.endTime)
        .map((activity) => getTime(activity.startTime));

      if (liveStartTimes.length > 0) {
        return liveStartTimes;
      }

      return group.scheduledActivities.map((activity) => getTime(activity.startTime));
    }),
  );

export const getActiveGroupsScheduledDuration = (groups: RemoteActivityGroup[]) => {
  const start = getActiveGroupsScheduledStartTime(groups);
  const end = getActiveGroupsScheduledEndTime(groups);

  if (start === undefined || end === undefined || end <= start) {
    return undefined;
  }

  return end - start;
};

const formatDurationMinutes = (duration: number | undefined) => {
  if (duration === undefined) {
    return '0 minutes';
  }

  const minutes = Math.max(1, Math.round(duration / MINUTE));
  const unit = minutes === 1 ? 'minute' : 'minutes';

  return `${minutes} ${unit}`;
};

export const formatElapsedDuration = (groups: RemoteActivityGroup[], now: Date) =>
  `${formatElapsedMMSS(getActiveGroupStartTime(groups), now)} / ${formatDurationMinutes(
    getActiveGroupsScheduledDuration(groups),
  )}`;

export const formatNextActivityOffset = (nextGroup: RemoteActivityGroup | undefined, now: Date) => {
  const nextStart = getGroupScheduledStartTime(nextGroup);

  if (!nextGroup || nextStart === undefined) {
    return 'No next activity';
  }

  const offsetMs = nextStart - now.getTime();
  const absoluteOffsetMinutes = Math.max(1, Math.ceil(Math.abs(offsetMs) / MINUTE));
  const minuteUnit = absoluteOffsetMinutes === 1 ? 'minute' : 'minutes';

  if (offsetMs < 0) {
    return `${absoluteOffsetMinutes} ${minuteUnit} ago`;
  }

  if (absoluteOffsetMinutes < 60) {
    return `In ${absoluteOffsetMinutes} ${minuteUnit}`;
  }

  const remainingHours = Math.ceil(absoluteOffsetMinutes / 60);
  const unit = remainingHours === 1 ? 'hour' : 'hours';

  return `In ${remainingHours} ${unit}`;
};

export const getRemoteBarProgress = ({
  activeGroups,
  now,
}: {
  activeGroups: RemoteActivityGroup[];
  now: Date;
}) => {
  const activeStart = getActiveGroupStartTime(activeGroups);
  const duration = getActiveGroupsScheduledDuration(activeGroups);

  if (activeStart === undefined || duration === undefined) {
    return {
      percent: 0,
      tone: 'normal' as const,
    };
  }

  const elapsed = Math.max(0, now.getTime() - activeStart);
  const percent = (elapsed / duration) * 100;

  return {
    percent: clampPercent(percent),
    tone:
      percent > 100
        ? ('overdue' as const)
        : percent >= 95
          ? ('warning' as const)
          : ('normal' as const),
  };
};
