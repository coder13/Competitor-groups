import { Competition } from '@wca/helpers';

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const getLocalDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isCompetitionDay = (wcif: Competition, date = new Date()) => {
  const currentDateKey = getDateKey(date);
  const startDate = getLocalDateFromKey(wcif.schedule.startDate);

  return Array.from({ length: wcif.schedule.numberOfDays }, (_, dayOffset) => {
    const competitionDate = new Date(startDate);
    competitionDate.setDate(startDate.getDate() + dayOffset);
    return getDateKey(competitionDate);
  }).includes(currentDateKey);
};

export const isCompetitionDayOrAfter = (wcif: Competition, date = new Date()) => {
  const currentDate = getLocalDateFromKey(getDateKey(date));
  const startDate = getLocalDateFromKey(wcif.schedule.startDate);

  return currentDate >= startDate;
};
