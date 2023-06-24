import { Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hasFlag } from 'country-flag-icons';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { useWCIF } from './WCIFProvider';
import { eventNameById } from '../../lib/events';
import { renderResultByEventId } from '../../lib/utils';
import classNames from 'classnames';

export default function PersonalBests() {
  const { wcif, setTitle } = useWCIF();
  const { wcaId } = useParams<{ wcaId: string }>();

  const person = wcif?.persons?.find((p) => p?.wcaId === wcaId);

  useEffect(() => {
    setTitle(`Personal Bests: ${person?.name}`);
  });

  if (!person) {
    return <div>Person not found</div>;
  }

  return (
    <>
      <div className="p-1">
        <div className="flex justify-between items-center my-2">
          <div className="flex flex-shrink items-center">
            <h3 className="text-xl sm:text-2xl">{person.name}</h3>
            {hasFlag(person.countryIso2) && (
              <div className="flex flex-shrink ml-2 text-lg sm:text-xl">
                {getUnicodeFlagIcon(person.countryIso2)}
              </div>
            )}
          </div>
          <a
            className="text-lg sm:text-xl hover:underline text-blue-600"
            href={`https://www.worldcubeassociation.org/persons/${person.wcaId}`}
            target="_blank"
            rel="noreferrer">
            {person.wcaId}
            <i className="ml-2 fa fa-solid fa-arrow-up-right-from-square" />
          </a>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-green-300 shadow-md">
          <tr>
            <th className="py-2 px-3">Type</th>
            <th>Best</th>
            <th>WR</th>
            <th>CR</th>
            <th>NR</th>
          </tr>
        </thead>
        <tbody>
          {wcif?.events
            ?.filter((event) => person?.registration?.eventIds.includes(event.id))
            .map((event) => {
              const eventId = event.id;

              const averagePb = person?.personalBests?.find(
                (p) => p.eventId === eventId && p.type === 'average'
              );
              const singlePb = person?.personalBests?.find(
                (p) => p.eventId === eventId && p.type === 'single'
              );

              return (
                <Fragment key={eventId}>
                  <tr>
                    <td colSpan={5} className="bg-green-200 py-2 px-3 text-center">
                      {eventNameById(eventId)}
                    </td>
                  </tr>
                  {singlePb && (
                    <tr>
                      <td className="px-3 py-2">Single</td>
                      <td className="px-3 py-2 text-center">
                        {renderResultByEventId(eventId, 'single', singlePb.best)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.worldRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.continentalRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={singlePb?.nationalRanking} />
                      </td>
                    </tr>
                  )}
                  {averagePb && (
                    <tr>
                      <td className="px-3 py-2">Average</td>
                      <td className="px-3 py-2 text-center">
                        {renderResultByEventId(eventId, 'average', averagePb.best)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.worldRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.continentalRanking} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Ranking ranking={averagePb?.nationalRanking} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
        </tbody>
      </table>
    </>
  );
}

const Ranking = ({ ranking }: { ranking: number }) => (
  <span
    className={classNames({
      'text-orange-500': ranking === 1,
    })}>
    {new Intl.NumberFormat([...navigator.languages]).format(ranking) || '-'}
  </span>
);
