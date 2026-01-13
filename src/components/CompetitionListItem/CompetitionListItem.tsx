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
          'link-card list-none flex flex-row cursor-pointer group transition-colors my-1 type-body',
          {
            'opacity-50': endDate < new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        )}>
        {hasFlag(country_iso2) && (
          <div className="flex flex-shrink mr-2 type-title">
            {' '}
            {getUnicodeFlagIcon(country_iso2)}{' '}
          </div>
        )}
        <div className="flex-1">
          <p className="type-heading leading-1 dark:text-white"> {name} </p>{' '}
          <p className="type-body-sm text-muted leading-1">
            {formatDateRange(start_date, end_date)}
            {'  '}&#8211;{'  '}
            {city}
          </p>
        </div>
        {isLive && (
          <div className="flex items-center flex-shrink px-2 type-title">
            <span className="text-green-500 fa fa-tower-broadcast" />
          </div>
        )}
        {isBookmarked && !isLive && (
          <div className="flex items-center flex-shrink px-2 type-title">
            <span className="text-yellow-500 fa fa-bookmark" />
          </div>
        )}
      </li>
    </Link>
  );
};
