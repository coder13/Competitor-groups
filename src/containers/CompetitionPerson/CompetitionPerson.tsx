import { Person } from '@wca/helpers';
import { Extension } from '@wca/helpers/lib/models/extension';
import { useEffect } from 'react';
import { Container } from '@/components/Container';
import { PersonalScheduleContainer } from '@/containers/PersonalSchedule';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionPersonContainerProps {
  registrantId: string;
}

export function CompetitionPersonContainer({ registrantId }: CompetitionPersonContainerProps) {
  const { wcif, setTitle } = useWCIF();

  const person = wcif?.persons?.find((p) => p.registrantId.toString() === registrantId) as
    | (Person & {
        extensions: Extension[];
      })
    | undefined;

  useEffect(() => {
    if (person) {
      setTitle(person.name);
    }
  }, [person, setTitle]);

  if (!wcif || !person) {
    return null;
  }

  return (
    <Container>
      <PersonalScheduleContainer person={person} />
    </Container>
  );
}
