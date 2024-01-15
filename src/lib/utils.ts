import {
  AttemptResult,
  Cutoff,
  EventId,
  RankingType,
  decodeMultiResult,
  formatCentiseconds,
  formatMultiResult,
} from '@wca/helpers';
import { format, parseISO } from 'date-fns';

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
  // month: 'numeric',
  // day: 'numeric',
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
  roundTime(new Date(isoString), minutes).toLocaleDateString([...navigator.languages], {
    weekday: 'short',
  });

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

// https://github.com/thewca/wca-live/blob/8884f8dc5bb2efcc3874f9fff4f6f3c098efbd6a/client/src/lib/date.js#L10
export const formatDateRange = (startString: string, endString: string) => {
  const [startDay, startMonth, startYear] = format(parseISO(startString), 'd MMM yyyy').split(' ');
  const [endDay, endMonth, endYear] = format(parseISO(endString), 'd MMM yyyy').split(' ');
  if (startString === endString) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }
  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
  }
  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
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

export const renderResultByEventId = (
  eventId: EventId,
  rankingType: RankingType,
  result: AttemptResult
) => {
  if (eventId === '333fm') {
    return rankingType === 'average' ? ((result as number) / 100).toFixed(2).toString() : result;
  }

  if (eventId === '333mbf') {
    return formatMultiResult(decodeMultiResult(result));
  }

  return formatCentiseconds(result as number);
};

export const renderCutoff = (cutoff: Cutoff) => {
  if (cutoff.numberOfAttempts === 0) {
    return '-';
  }

  return `${formatCentiseconds(cutoff.attemptResult).replace(/\.00+$/, '')}`;
}


export const renderCentiseconds = (centiseconds: number) => {
  if (centiseconds >= 60000) {
    const hours = Math.floor(centiseconds / 360000);
    const centi = formatCentiseconds(centiseconds - hours * 360000).replace(/\.00+$/, '');
    return hours ? `${hours}:${centi}` : centi;
  }

  return formatCentiseconds(centiseconds).replace(/\.00+$/, '');
};
