import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { allActivities, parseActivityCode } from '../../../lib/activities';
import { useWCIF } from '../../../providers/WCIFProvider';
import { EventActivity } from './EventActivity';
import { OtherActivity } from './OtherActivity';
import { Container } from '../../../components/Container';

export function CompetitionActivity() {
  const { wcif } = useWCIF();
  const { activityId } = useParams();

  const activity = useMemo(
    () => wcif && allActivities(wcif).find((a) => activityId && a.id === parseInt(activityId, 10)),
    [wcif, activityId]
  );

  const { eventId } = parseActivityCode(activity?.activityCode || '');

  const everyoneInActivity = useMemo(
    () =>
      wcif
        ? wcif.persons
            .map((person) => ({
              ...person,
              assignments: person.assignments?.filter(
                (a) => activityId && a.activityId === parseInt(activityId, 10) // TODO this is a hack because types aren't fixed yet for @wca/helpers
              ),
            }))
            .filter(({ assignments }) => assignments && assignments.length > 0)
        : [],
    [wcif, activityId]
  );

  const isEventGroup = !eventId?.startsWith('other');
  const GroupComponent = isEventGroup ? EventActivity : OtherActivity;

  return (
    <Container>
      {wcif?.id && activity && everyoneInActivity && (
        <GroupComponent competitionId={wcif.id} activity={activity} persons={everyoneInActivity} />
      )}
    </Container>
  );
}
