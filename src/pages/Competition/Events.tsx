import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupActivitiesByRound, parseActivityCode } from '../../lib/activities';
import { eventNameById } from '../../lib/events';
import { useWCIF } from '../../providers/WCIFProvider';
import { Container } from '../../components/Container';

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const Events = () => {
  const { wcif, setTitle } = useWCIF();
  const navigate = useNavigate();

  const uniqueGroupCountForRound = useCallback(
    (roundId: string) =>
      wcif
        ? groupActivitiesByRound(wcif, roundId)
            .map(({ activityCode }) => activityCode)
            .filter(onlyUnique).length
        : 0,
    [wcif]
  );

  useEffect(() => {
    setTitle('Events');
  }, [setTitle]);

  return (
    <Container>
      <div className="flex flex-col w-full">
        <br />
        <div className="shadow-md border-slate-300 rounded-md">
          <table className="w-full text-left">
            <thead className="bg-slate-200">
              <tr>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3 text-center">Round</th>
                <th className="px-6 py-3 text-center">Groups</th>
                <th className="px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {wcif?.events.map((event) =>
                event.rounds?.map((round, index) => {
                  const url = `/competitions/${wcif.id}/events/${round.id}`;

                  return (
                    <tr
                      key={round.id}
                      className="hover:bg-blue-100 border even:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(url)}>
                      <td className="px-5 py-3">{index === 0 ? eventNameById(event.id) : ''}</td>
                      <td className="px-5 py-3 text-center">
                        {parseActivityCode(round.id).roundNumber}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {uniqueGroupCountForRound(round.id)}
                      </td>
                      <td className="px-5 py-3 text-right">View</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default Events;
