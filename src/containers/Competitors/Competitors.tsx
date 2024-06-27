import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptedRegistration } from '../../lib/activities';
import { byName } from '../../lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import { Competition } from '@wca/helpers';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';

export const Competitors = ({ wcif }: { wcif: Competition }) => {
  const { competitionId } = useParams();
  const { user } = useAuth();
  const acceptedPersons = useMemo(
    () =>
      wcif?.persons
        ?.filter(acceptedRegistration)
        .filter(
          (person) => !!person.registration?.eventIds?.length || !!person.assignments?.length
        ) || [],
    [wcif]
  );

  const me = acceptedPersons.find((person) => person.wcaUserId === user?.id);

  const { ongoingActivities } = useOngoingActivities(competitionId!);

  return (
    <div className="w-full h-full flex flex-1 flex-col p-2">
      {me && (
        <>
          <Link
            className="border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row"
            to={`persons/${me.registrantId}`}>
            My Assignments
          </Link>
          <hr className="my-2" />
        </>
      )}
      <ul>
        {acceptedPersons.sort(byName).map((person) => {
          const assignedActivity = person.assignments?.find((a) =>
            ongoingActivities.some((oa) => oa.id === a.activityId)
          );

          return (
            <Link key={person.registrantId} to={`persons/${person.registrantId}`}>
              <li className="border bg-white list-none rounded-md flex justify-between cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row">
                <div className="p-1">{person.name}</div>
                {assignedActivity ? (
                  <AssignmentCodeCell
                    as="div"
                    className="text-sm p-1 rounded-md text-gray-500"
                    assignmentCode={assignedActivity.assignmentCode}
                    grammar="verb"
                  />
                ) : null}
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};
