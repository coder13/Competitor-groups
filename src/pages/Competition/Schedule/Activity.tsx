import { Activity, activityCodeToName } from '@wca/helpers';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { getAllActivities } from '@/lib/activities';
import { parseActivityCodeFlexible } from '@/lib/activityCodes';
import { useWCIF } from '@/providers/WCIFProvider';
import { EventActivity } from './EventActivity';
import { OtherActivity } from './OtherActivity';

export function CompetitionActivity() {
  const { wcif } = useWCIF();
  const { activityId } = useParams();

  const activity = useMemo(
    () =>
      wcif && getAllActivities(wcif).find((a) => activityId && a.id === parseInt(activityId, 10)),
    [wcif, activityId],
  );

  const everyoneInActivity = useMemo(
    () =>
      wcif
        ? wcif.persons
            .map((person) => ({
              ...person,
              assignments: person.assignments?.filter(
                (a) => activityId && a.activityId === parseInt(activityId, 10), // TODO this is a hack because types aren't fixed yet for @wca/helpers
              ),
            }))
            .filter(({ assignments }) => assignments && assignments.length > 0)
        : [],
    [wcif, activityId],
  );

  if (!activity) {
    return (
      <Container>
        <h2>Activity not found</h2>
      </Container>
    );
  }

  const { eventId } = parseActivityCodeFlexible(activity.activityCode);

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

export const niceActivityName = (activty: Activity) => {
  if (activty.activityCode.startsWith('other')) {
    return activty.name;
  } else {
    try {
      return activityCodeToName(activty.activityCode);
    } catch (e) {
      console.error(e);
      return activty.name;
    }
  }
};
