import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { acceptedRegistration } from '../../lib/person';
import { byName } from '../../lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import { Competition } from '@wca/helpers';
import { useOngoingActivities } from '../../hooks/useOngoingActivities';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';
import { LinkButton } from '../../components/LinkButton';

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
    <>
      {me && (
        <div className="flex w-full">
          <LinkButton
            className="w-full"
            to={`/competitions/${competitionId}/personal-schedule`}
            title="My Assignments"
            color="blue"
          />
        </div>
      )}
      <ul className="">
        {acceptedPersons.sort(byName).map((person) => {
          const assignedActivity = person.assignments?.find((a) =>
            ongoingActivities.some((oa) => oa.id === a.activityId)
          );

          return (
            <Link key={person.registrantId} to={`persons/${person.registrantId}`}>
              <li className="border bg-white list-none rounded-md flex justify-between cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row min-h-[40px] items-center">
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
    </>
  );
};
