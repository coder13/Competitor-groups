import { useEffect, useMemo } from 'react';
import { Container } from '@/components/Container';
import { StatsBox } from '@/pages/Competition/Stats/StatsBox';
import { useWCIF } from '@/providers/WCIFProvider';

export function CompetitionStatsContainer() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(wcif?.name + ' Stats');
  }, [wcif, setTitle]);

  const eventCount = wcif?.events?.length || 0;
  const acceptedRegistrations = useMemo(
    () =>
      wcif?.persons?.filter(
        ({ registration }) => registration?.isCompeting && registration?.status === 'accepted',
      ),
    [wcif],
  );
  const acceptedRegistrationsCount = acceptedRegistrations?.length || 0;

  return (
    <Container className="space-y-4 p-2">
      <div className="grid grid-cols-2 gap-2 type-heading">
        <StatsBox title="Competitors" value={acceptedRegistrationsCount} />
        <StatsBox title="Events" value={eventCount} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {wcif?.events?.map(({ id }) => {
          const registrationCount =
            acceptedRegistrations?.filter(({ registration }) => registration?.eventIds.includes(id))
              .length ?? 0;

          return (
            <div
              key={id}
              className="flex items-center justify-between gap-2 rounded-md border border-tertiary-weak bg-panel px-3 py-2 shadow-sm">
              <span className={`cubing-icon event-${id} shrink-0 type-body`} />
              <span className="type-label text-default">{registrationCount}</span>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
