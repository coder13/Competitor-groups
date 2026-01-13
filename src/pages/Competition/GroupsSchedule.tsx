// import { useWCIF } from './WCIFProvider';
import { Container } from '@/components/Container';

const Events = () => {
  // const { wcif } = useWCIF();

  // allChildActivities

  return (
    <Container>
      <div>
        <br />
        <div className="shadow-md border border-gray-300 rounded-md">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3 text-center">Activity</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default Events;
