import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { allActivities, parseActivityCode } from '../../lib/activities';
import { eventNameById } from '../../lib/events';
import { useWCIF } from './WCIFProvider';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const Events = () => {
  const { wcif } = useWCIF();

  const groups = useMemo(() => allActivities(wcif), [wcif]);
  const uniqueGroupCountForRound = useCallback(
    (roundId) =>
      groups
        .filter((groupActivity) => {
          const groupActivityCode = parseActivityCode(groupActivity.activityCode);
          const roundActivityCode = parseActivityCode(roundId);
          return (
            groupActivityCode.eventId === roundActivityCode.eventId &&
            groupActivityCode.roundNumber === roundActivityCode.roundNumber
          );
        })
        .map(({ activityCode }) => activityCode)
        .filter(onlyUnique).length,
    [groups]
  );

  return (
    <div>
      <br />
      <div className="shadow-md border border-slate-300 rounded-md">
        <table className="w-full text-left">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-6 py-3">Event</th>
              <th className="px-6 py-3">Round</th>
              <th className="px-6 py-3">Groups</th>
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
                  <Link key={round.id} className="table-row hover:bg-slate-100" to={url}>
                    <td className="px-5 py-3">{index === 0 ? eventNameById(event.id) : ''}</td>
                    <td className="px-5 py-3">{parseActivityCode(round.id).roundNumber}</td>
                    <td className="px-5 py-3">{uniqueGroupCountForRound(round.id)}</td>
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
