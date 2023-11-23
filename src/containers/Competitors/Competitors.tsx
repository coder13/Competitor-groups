import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { acceptedRegistration } from '../../lib/activities';
import { byName } from '../../lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import { Competition } from '@wca/helpers';

export const Competitors = ({ wcif }: { wcif: Competition }) => {
  const { user } = useAuth();
  const acceptedPersons = useMemo(
    () =>
      wcif?.persons
        ?.filter(acceptedRegistration)
        .filter(
          (person) =>
            !!person.registration?.eventIds?.length ||
            !!person.assignments?.length
        ) || [],
    [wcif]
  );

  const me = acceptedPersons.find((person) => person.wcaUserId === user?.id);

  return (
    <div className="w-full h-full flex flex-1 flex-col p-2">
      {me && (
        <>
          <Link
            className="border bg-blue-200 rounded-md p-2 px-1 flex cursor-pointer hover:bg-blue-400 group transition-colors my-1 flex-row"
            to={`persons/${me.registrantId}`}>
            My Assignments
          </Link>
          <br />
          <hr />
          <br />
        </>
      )}
      <ul>
        {acceptedPersons.sort(byName).map((person) => (
          <Link key={person.registrantId} to={`persons/${person.registrantId}`}>
            <li className="border bg-white list-none rounded-md px-1 py-1 flex cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row">
              {person.name}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};
