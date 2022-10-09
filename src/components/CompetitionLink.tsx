import { Link } from 'react-router-dom';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

const CompetitionLink = ({ id, name, start_date, country_iso2 }) => {
  return (
    <Link to={`/competitions/${id}`}>
      <li className="border bg-white list-none rounded-md px-1 py-1 flex cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row">
        {hasFlag(country_iso2) && (
          <div className="flex flex-shrink mr-2 text-2xl"> {getUnicodeFlagIcon(country_iso2)} </div>
        )}{' '}
        <div className="flex-1">
          <p className="font-normal leading-1"> {name} </p>{' '}
          <p className="text-gray-600 text-sm leading-1"> {start_date} </p>{' '}
        </div>
      </li>
    </Link>
  );
};

export default CompetitionLink;
