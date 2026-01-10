import classNames from 'classnames';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { Link } from 'react-router-dom';
import { formatDateRange } from '@/lib/time';

interface CompetitionListItemProps {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  country_iso2: string;
  city: string;
  isLive: boolean;
  isBookmarked?: boolean;
}

export const CompetitionListItem = ({
  id,
  name,
  start_date,
  end_date,
  country_iso2,
  city,
  isLive,
  isBookmarked,
}: CompetitionListItemProps) => {
  const endDate = new Date(
    new Date(end_date).getTime() + 1000 * 60 * new Date().getTimezoneOffset(),
  );

  return (
    <Link to={`/competitions/${id}`}>
      <li
        className={classNames(
          'border bg-white dark:bg-gray-800 dark:border-gray-700 list-none rounded-md px-2 py-2 flex cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-700 group transition-colors my-1 flex-row',
          {
            'opacity-50': endDate < new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        )}>
        {hasFlag(country_iso2) && (
          <div className="flex flex-shrink mr-2 text-2xl"> {getUnicodeFlagIcon(country_iso2)} </div>
        )}
        <div className="flex-1">
          <p className="font-normal leading-1 dark:text-white"> {name} </p>{' '}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-1">
            {formatDateRange(start_date, end_date)}
            {'  '}&#8211;{'  '}
            {city}
          </p>
        </div>
        {isLive && (
          <div className="flex flex-shrink text-2xl items-center px-2">
            <span className="fa fa-tower-broadcast text-green-500" />
          </div>
        )}
        {isBookmarked && !isLive && (
          <div className="flex flex-shrink text-2xl items-center px-2">
            <span className="fa fa-bookmark text-yellow-500" />
          </div>
        )}
      </li>
    </Link>
  );
};
