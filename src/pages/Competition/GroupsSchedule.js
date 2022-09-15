import { useWCIF } from './WCIFProvider';

const Events = () => {
  const { wcif } = useWCIF();

  // allChildActivities

  return (
    <div>
      <br />
      <div className="shadow-md border border-slate-300 rounded-md">
        <table className="w-full text-left">
          <thead className="bg-slate-200">
            <tr>
              <th className="px-6 py-3">Stage</th>
              <th className="px-6 py-3 text-center">Activity</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Events;
