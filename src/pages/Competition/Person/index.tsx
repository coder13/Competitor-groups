import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWCIF } from '../../../providers/WCIFProvider';
import { Extension } from '@wca/helpers/lib/models/extension';
import { Person } from '@wca/helpers';
import { Container } from '../../../components/Container';
import { PersonalScheduleContainer } from '../../../containers/PersonalSchedule';

const worldsAssignmentMap = {
  'wca booth': 'WCA Booth',
  'help desk': 'Help Desk',
  data: 'Data Entry',
  commentary: 'Commentary',
  media: 'Media',
};

export const byDate = (
  a: { startTime: string } | undefined,
  b: { startTime: string } | undefined
) => {
  const aDate = a ? new Date(a.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  const bDate = b ? new Date(b.startTime).getTime() : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
};

export default function PersonPage() {
  const { wcif, setTitle } = useWCIF();
  const { registrantId } = useParams();

  const person = wcif?.persons?.find(
    (p) => p.registrantId.toString() === registrantId
  ) as Person & {
    extensions: Extension[];
  };

  useEffect(() => {
    if (person) {
      setTitle(person.name);
    }
  }, [person, setTitle]);

  if (!wcif) {
    return null;
  }

  return (
    <Container>
      <PersonalScheduleContainer wcif={wcif} person={person} />
    </Container>
  );
}
