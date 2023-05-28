import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptedRegistration, queryMatch } from '../../../lib/activities';
import { byName } from '../../../lib/utils';
import { useAuth } from '../../../providers/AuthProvider';

export default function Competitors({ wcif }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const acceptedPersons = useMemo(
    () =>
      wcif.persons.filter((person) => acceptedRegistration(person) && queryMatch(person, query)),
    [wcif, query]
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
        <div className="flex justify-center">
          <div className="mb-3 w-full">
            <div className="relative mb-4 flex w-full flex-wrap items-stretch">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="relative m-0 -mr-px block w-[1%] min-w-0 flex-auto rounded-l border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-1.5 text-base font-normal text-neutral-700 outline-none transition duration-300 ease-in-out focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:text-neutral-200 dark:placeholder:text-neutral-200"
                placeholder="Search By Name"
                aria-label="Search"
                aria-describedby="button-addon1"
              />
            </div>
          </div>
        </div>
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
}
