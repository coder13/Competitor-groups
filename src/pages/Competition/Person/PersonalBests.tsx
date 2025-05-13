import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/Container';
import { PersonalBestsContainer } from '@/containers/PersonalBests/PersonalBests';
import { useWCIF } from '@/providers/WCIFProvider';

export default function PersonalBests() {
  const { wcif, setTitle } = useWCIF();
  const { wcaId } = useParams<{ wcaId: string }>();

  const person = wcif?.persons?.find((p) => p?.wcaId === wcaId);

  useEffect(() => {
    setTitle(`Personal Bests: ${person?.name}`);
  });

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
