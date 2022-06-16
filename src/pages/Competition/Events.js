import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { groupActivitiesByRound, parseActivityCode } from '../../lib/activities';
import { eventNameById } from '../../lib/events';
import { useWCIF } from './WCIFProvider';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const Events = () => {
  const { wcif } = useWCIF();

  const uniqueGroupCountForRound = useCallback(
    (roundId) =>
      groupActivitiesByRound(wcif, roundId)
        .map(({ activityCode }) => activityCode)
        .filter(onlyUnique).length,
    [wcif]
  );

  return (
    <div>
      <br />
      <div className="shadow-md border border-slate-300 rounded-md">
        <table className="w-full text-left">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-6 py-3">Event</th>
              <th className="px-6 py-3 text-center">Round</th>
              <th className="px-6 py-3 text-center">Groups</th>
              <th className="px-6 py-3">
                <span class="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {wcif.events.map((event) =>
              event.rounds.map((round, index) => {
                const url = `/competitions/${wcif.id}/events/${round.id}`;
                return (
                  <Link
                    key={round.id}
                    className="table-row hover:bg-blue-100 border even:bg-slate-50"
                    to={url}>
                    <td className="px-5 py-3">{index === 0 ? eventNameById(event.id) : ''}</td>
                    <td className="px-5 py-3 text-center">
                      {parseActivityCode(round.id).roundNumber}
                    </td>
                    <td className="px-5 py-3 text-center">{uniqueGroupCountForRound(round.id)}</td>
                    <td className="px-5 py-3 text-right">View</td>
                  </Link>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Events;
