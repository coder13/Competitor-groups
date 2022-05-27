import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { acceptedRegistration } from '../../../lib/utils';
import { Container } from '../../../components/Grid';

export default function Competitors({ wcif }) {
  const acceptedPersons = useMemo(() => wcif.persons.filter(acceptedRegistration), [wcif]);

  return (
    <Container style={{ overflowY: 'auto' }}>
      <ul>
        {acceptedPersons.map((person) => (
          <li>
            <Link to={`persons/${person.registrantId}`}>{person.name}</Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
