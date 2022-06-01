import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { acceptedRegistration, byName } from '../../../lib/activities';

export default function Competitors({ wcif }) {
  const acceptedPersons = useMemo(() => wcif.persons.filter(acceptedRegistration), [wcif]);

  return (
    <div className="w-full h-full flex flex-1 flex-col p-2">
      <ul>
        {acceptedPersons.sort(byName).map((person) => (
          <Link to={`persons/${person.registrantId}`}>
            <li className="border bg-white list-none rounded-md px-1 py-1 flex cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row">
              {person.name}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
