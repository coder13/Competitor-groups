import { memo } from 'react';

interface VenueInformationProps {
  name?: string;
  address?: string;
  city?: string;
  details?: string;
  mapUrl: string;
}

export const VenueInformation = memo(function VenueInformation({
  name,
  address,
  city,
  details,
  mapUrl,
}: VenueInformationProps) {
  return (
    <div className="flex flex-col w-full gap-2 rounded border border-slate-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <a
        className="flex flex-col gap-2 rounded align-center hover:opacity-80 link-inline"
        href={mapUrl}
        target="_blank"
        rel="noreferrer">
        <div className="flex items-start justify-between gap-2">
          <span className="type-heading">{name}</span>
          <i className="m-0 fa fa-solid fa-arrow-up-right-from-square" />
        </div>
        <span className="text-sm text-slate-600 dark:text-gray-300">
          {address}
          {address && city ? ', ' : ''}
          {city}
        </span>
      </a>
      {details && <p className="type-body">{details}</p>}
    </div>
  );
});
