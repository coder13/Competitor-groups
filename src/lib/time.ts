import { format, parseISO } from 'date-fns';
import { roundTime } from './utils';

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
export const isValidNumber = (n: number | null) => typeof n === 'number' && !isNaN(n);

/**
 * Returns a DateTimeFormat object for numeric date formatting
 */
export const getNumericDateFormatter = (timeZone?: string) =>
  new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone,
  });

/**
 * Formats into a numeric date based on timezone for easier grouping of assignments by date
 */
export const formatNumericDate = (date: Date, timeZone?: string) =>
  date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone,
  });
