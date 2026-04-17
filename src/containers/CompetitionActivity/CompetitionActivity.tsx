import { useMemo } from 'react';
import { Container } from '@/components/Container';
import { getAllActivities } from '@/lib/activities';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { EventActivity } from '@/pages/Competition/Schedule/EventActivity';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionActivityContainerProps {
  competitionId: string;
  activityId: number;
  LinkComponent?: LinkRenderer;
  onNavigate?: (to: string) => void;
}

export function CompetitionActivityContainer({
  competitionId,
  activityId,
  LinkComponent = AnchorLink,
  onNavigate = (to) => window.location.assign(to),
}: CompetitionActivityContainerProps) {
  const { wcif } = useWCIF();

  const activity = useMemo(
    () => wcif && getAllActivities(wcif).find((a) => a.id === activityId),
    [wcif, activityId],
  );

  const everyoneInActivity = useMemo(
    () =>
      wcif
        ? wcif.persons
            .map((person) => ({
              ...person,
              assignments: person.assignments?.filter((a) => a.activityId === activityId),
            }))
            .filter(({ assignments }) => assignments && assignments.length > 0)
        : [],
    [wcif, activityId],
  );

  if (!wcif) {
    return <Container />;
  }

  if (!activity) {
    return (
      <Container>
        <h2>Activity not found</h2>
      </Container>
    );
  }

  return (
    <Container>
      <EventActivity
        competitionId={competitionId}
        activity={activity}
        persons={everyoneInActivity}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />
    </Container>
  );
}
