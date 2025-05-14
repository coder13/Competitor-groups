import { parseISO } from 'date-fns';
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
  timeZone?: string,
) => `${formatTime(start, minutes, timeZone)} - ${formatTime(end, minutes, timeZone)}`;

export const formatDateTimeRange = (
  start: string,
  end: string,
  minutes: number = 5,
  timeZone?: string,
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

export const formatDateRange = (start: string, end: string) => {
  const scheduleDateTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return scheduleDateTimeFormatter.formatRange(parseISO(start), parseISO(end));
};

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
  getNumericDateFormatter(timeZone).format(date);

export const getLocalizedTimeZoneName = (timeZoneId: string) => {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    timeZone: timeZoneId,
    timeZoneName: 'long',
  });

  const parts = formatter.formatToParts(new Date());
  return parts.find((p) => p.type === 'timeZoneName')?.value || timeZoneId;
};
