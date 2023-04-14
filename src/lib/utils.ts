export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
export const byDate = <T>(a: T & { startTime: string }, b: T & { startTime: string }) =>
  new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

/**
 * Use with filter
 * @param {*} v
 * @param {*} i
 * @param {*} arr
 * @returns
 */
export const unique = <T>(v: T, i: number, arr: T[]): boolean => {
  // compare index with first element index
  return i === arr.indexOf(v);
};

export const groupBy = <T>(xs: T[], getKey: (x: T) => string): Record<string, T[]> =>
  xs.reduce((rv, x) => {
    (rv[getKey(x)] ||= []).push(x);
    return rv;
  }, {});

export const groupByMap = <T, S>(
  xs: T[],
  getKey: (x: T) => string,
  fn: (x: T[]) => S
): Record<string, S> => {
  const grouped = groupBy(xs, getKey);
  const newGrouped = {};
  Object.keys(grouped).forEach((key) => {
    newGrouped[key] = fn(grouped[key]);
  });
  return newGrouped;
};

export const roundTime = (date: Date, minutes: number = 5) => {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

const FormatTimeSettings: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

const FormatDateSettings: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const formatTime = (isoString: string, minutes: number = 5, timeZone?: string) =>
  roundTime(new Date(isoString), minutes).toLocaleTimeString([...navigator.languages], {
    ...FormatTimeSettings,
    ...(timeZone && {
      timeZone,
    }),
  });

export const formmatDate = (isoString: string, minutes: number = 5) =>
  roundTime(new Date(isoString), minutes).toLocaleDateString([...navigator.languages]);

export const formatDateTime = (isoString: string, minutes: number = 5, timeZone?: string) =>
  roundTime(new Date(isoString), minutes).toLocaleTimeString([...navigator.languages], {
    ...FormatDateSettings,
    ...FormatTimeSettings,
    ...(timeZone && {
      timeZone,
    }),
  });

export const formatTimeRange = (
  start: string,
  end: string,
  minutes: number = 5,
  timeZone?: string
) => `${formatTime(start, minutes, timeZone)} - ${formatTime(end, minutes, timeZone)}`;

export const formatDateTimeRange = (
  start: string,
  end: string,
  minutes: number = 5,
  timeZone?: string
) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.toLocaleDateString() === endDate.toLocaleDateString()) {
    return `${formmatDate(start)} ${formatTimeRange(start, end, minutes, timeZone)}`;
  }

  return `${formatDateTime(start, minutes, timeZone)} - ${formatDateTime(end, minutes, timeZone)}`;
};

export const DateTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
  weekday: 'long',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

export const formatDate = (date: Date) => DateTimeFormatter.format(date);
export const formatToParts = (date: Date) => DateTimeFormatter.formatToParts(date);

export const formatToWeekDay = (date: Date) =>
  formatToParts(date).find((p) => p.type === 'weekday')?.value;
