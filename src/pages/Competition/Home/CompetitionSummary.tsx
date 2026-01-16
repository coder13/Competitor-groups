import { addDays, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateRange } from '@/lib/time';

interface CompetitionSummaryProps {
  startDate?: string;
  numberOfDays?: number;
  venueName?: string;
}

const getDateRangeValue = (startDate?: string, numberOfDays?: number) => {
  if (!startDate) {
    return undefined;
  }

  const start = parseISO(startDate);
  const end = numberOfDays && numberOfDays > 1 ? addDays(start, numberOfDays - 1) : start;
  const endDate = end.toISOString().split('T')[0];

  return formatDateRange(startDate, endDate);
};

export const CompetitionSummary = ({
  startDate,
  numberOfDays,
  venueName,
}: CompetitionSummaryProps) => {
  const { t } = useTranslation();
  const dateRange = useMemo(
    () => getDateRangeValue(startDate, numberOfDays),
    [startDate, numberOfDays],
  );

  if (!dateRange && !venueName) {
    return null;
  }

  return (
    <div className="flex flex-col items-start text-base gap-y-1 text-slate-600 dark:text-gray-300">
      {dateRange && (
        <span>
          <span className="font-semibold text-slate-900 dark:text-gray-100">{dateRange}</span>
        </span>
      )}
      {venueName && (
        <span>
          <span className="text-slate-900 dark:text-gray-100">{venueName}</span>
        </span>
      )}
    </div>
  );
};
