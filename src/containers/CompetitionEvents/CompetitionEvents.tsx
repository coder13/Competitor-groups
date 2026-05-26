import { useCallback, useEffect, useMemo } from 'react';
import { Container } from '@/components/Container';
import { RoundActionPicker } from '@/components/RoundActionPicker';
import { groupActivitiesByRound } from '@/lib/activities';
import { getAllEvents, getEventName } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionEventsContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export function CompetitionEventsContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionEventsContainerProps) {
  const { wcif, setTitle } = useWCIF();

  const uniqueGroupCountForRound = useCallback(
    (roundId: string) =>
      wcif
        ? groupActivitiesByRound(wcif, roundId)
            .map(({ activityCode }) => activityCode)
            .filter(onlyUnique).length
        : 0,
    [wcif],
  );

  const events = useMemo(() => (wcif ? getAllEvents(wcif) : []), [wcif]);
  const pickerEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        name: getEventName(event.id, event),
        rounds: event.rounds.map((round, index) => ({
          id: round.id,
          roundNumber: index + 1,
          groupCount: uniqueGroupCountForRound(round.id),
          href: `/competitions/${competitionId}/events/${round.id}`,
        })),
      })),
    [competitionId, events, uniqueGroupCountForRound],
  );

  useEffect(() => {
    setTitle('Events');
  }, [setTitle]);

  return (
    <Container className="pt-4">
      <div className="p-2">
        <RoundActionPicker mode="groups" events={pickerEvents} LinkComponent={LinkComponent} />
      </div>
    </Container>
  );
}
