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

export const formatNextActivityOffset = (nextGroup: RemoteActivityGroup | undefined, now: Date) => {
  const nextStart = getGroupScheduledStartTime(nextGroup);

  if (!nextGroup || nextStart === undefined) {
    return 'No next activity';
  }

  const remainingMs = nextStart - now.getTime();

  if (remainingMs <= 0) {
    return 'Now';
  }

  const remainingMinutes = Math.ceil(remainingMs / MINUTE);

  if (remainingMinutes < 60) {
    const unit = remainingMinutes === 1 ? 'minute' : 'minutes';
    return `In ${remainingMinutes} ${unit}`;
  }

  const remainingHours = Math.ceil(remainingMinutes / 60);
  const unit = remainingHours === 1 ? 'hour' : 'hours';

  return `In ${remainingHours} ${unit}`;
};

export const getRemoteBarProgress = ({
  activeGroups,
  nextGroup,
  now,
}: {
  activeGroups: RemoteActivityGroup[];
  nextGroup?: RemoteActivityGroup;
  now: Date;
}) => {
  const activeStart = getActiveGroupStartTime(activeGroups);
  const nextStart = getGroupScheduledStartTime(nextGroup);

  if (activeStart === undefined || nextStart === undefined) {
    return nextStart !== undefined && now.getTime() >= nextStart ? 100 : 0;
  }

  const duration = nextStart - activeStart;

  if (duration <= 0) {
    return now.getTime() >= nextStart ? 100 : 0;
  }

  return clampPercent(((now.getTime() - activeStart) / duration) * 100);
};
