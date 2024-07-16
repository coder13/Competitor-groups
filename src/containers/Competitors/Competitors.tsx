import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptedRegistration } from '../../lib/person';
import { byName } from '../../lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import { Competition } from '@wca/helpers';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';
import { LinkButton } from '../../components/LinkButton';
import { usePinnedPersons } from '../../hooks/UsePinnedPersons';
import { CompetitorListItem } from './CompetitorListItem';

export const Competitors = ({ wcif }: { wcif: Competition }) => {
  const { competitionId } = useParams() as { competitionId: string };
  const { user } = useAuth();

  const { pinnedPersons } = usePinnedPersons(competitionId);

  const acceptedPersons = useMemo(
    () =>
      wcif?.persons
        ?.filter(acceptedRegistration)
        .filter((person) => !!person.registration?.eventIds?.length || !!person.assignments?.length)
        .sort(byName) || [],
    [wcif]
  );

  const me = acceptedPersons.find((person) => person.wcaUserId === user?.id);
  const everyoneButMe = acceptedPersons.filter((person) => person.wcaUserId !== user?.id);

  const { ongoingActivities } = useOngoingActivities(competitionId!);

  const acceptedPinnedPersons = everyoneButMe.filter((person) =>
    pinnedPersons.includes(person.registrantId)
  );

  const acceptedUnpinnedPersons = everyoneButMe.filter(
    (person) => !pinnedPersons.includes(person.registrantId)
  );

  const persons = me
    ? [me, ...acceptedPinnedPersons, ...acceptedUnpinnedPersons]
    : [...acceptedPinnedPersons, ...acceptedUnpinnedPersons];

  return (
    <ul className="">
      {persons.map((person) => {
        const assignedActivity = person.assignments?.find((a) =>
          ongoingActivities.some((oa) => oa.id === a.activityId)
        );

        return (
          <CompetitorListItem
            highlight={person.registrantId === me?.registrantId}
            bookmarked={pinnedPersons.includes(person.registrantId)}
            key={person.registrantId}
            person={person}
            currentAssignmentCode={assignedActivity?.assignmentCode}
          />
        );
      })}
    </ul>
  );
};
