import { useWCIF } from '../../../providers/WCIFProvider';
import { Container } from '../../../components/Container';
import { useEffect, useMemo } from 'react';
import { StatsBox } from './StatsBox';

export default function Round() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(wcif?.name + ' Stats');
  }, [wcif, setTitle]);

  const eventCount = wcif?.events?.length || 0;

  const acceptedRegistrations = useMemo(
    () =>
      wcif?.persons?.filter(
        ({ registration }) => registration?.isCompeting && registration?.status === 'accepted'
      ),
    [wcif]
  );

  const acceptedRegistrationsCount = acceptedRegistrations?.length || 0;

  return (
    <Container className="space-y-2 p-2">
      <div className="flex justify-evenly">
        <StatsBox title="Competitors" value={acceptedRegistrationsCount} />
        <StatsBox title="Events" value={eventCount} />
      </div>
      <hr />
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${eventCount}, 1fr)`,
        }}>
        {wcif?.events?.map(({ id }) => (
          <span key={id} className={`cubing-icon event-${id} mx-1 text-xl text-center`} />
        ))}
        {wcif?.events?.map(({ id }) => (
          <span key={id} className="text-center">
            {
              acceptedRegistrations?.filter(({ registration }) =>
                registration?.eventIds.includes(id)
              )?.length
            }
          </span>
        ))}
      </div>
    </Container>
  );
}
