import { useEffect } from 'react';
import { Container } from '@/components/Container';
import { PersonalBestsContainer } from '@/containers/PersonalBests';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionPersonalBestsContainerProps {
  wcaId: string;
}

export function CompetitionPersonalBestsContainer({
  wcaId,
}: CompetitionPersonalBestsContainerProps) {
  const { wcif, setTitle } = useWCIF();
  const person = wcif?.persons?.find((p) => p?.wcaId === wcaId);

  useEffect(() => {
    setTitle(`Personal Bests: ${person?.name}`);
  }, [person?.name, setTitle]);

  if (!wcif) {
    return null;
  }

  if (!person) {
    return <div>Person not found</div>;
  }

  return (
    <Container>
      <PersonalBestsContainer wcif={wcif} person={person} />
    </Container>
  );
}
