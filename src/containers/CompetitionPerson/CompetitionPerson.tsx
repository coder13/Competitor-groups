import { Person } from '@wca/helpers';
import { Extension } from '@wca/helpers/lib/models/extension';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CompetitionPersonalResultsContent } from '@/containers/CompetitionPersonalResults';
import { PersonalBestsContainer } from '@/containers/PersonalBests';
import { PersonalScheduleContent } from '@/containers/PersonalSchedule';
import { PersonalPage, PersonalPageLayout } from '@/containers/PersonalSchedule/PersonalPageLayout';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionPersonContainerProps {
  registrantId: string;
}

export function CompetitionPersonContainer({ registrantId }: CompetitionPersonContainerProps) {
  const { competitionId, wcif, setTitle } = useWCIF();
  const { pathname } = useLocation();

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

  const activePage: PersonalPage = pathname.endsWith('/results')
    ? 'results'
    : pathname.endsWith('/records')
      ? 'records'
      : 'schedule';

  const content = (() => {
    if (activePage === 'results') {
      return <CompetitionPersonalResultsContent person={person} LinkComponent={Link} />;
    }

    if (activePage === 'records') {
      return person.wcaId ? <PersonalBestsContainer wcif={wcif} person={person} /> : null;
    }

    return <PersonalScheduleContent person={person} />;
  })();

  return (
    <PersonalPageLayout activePage={activePage} competitionId={competitionId} person={person}>
      {content}
    </PersonalPageLayout>
  );
}
